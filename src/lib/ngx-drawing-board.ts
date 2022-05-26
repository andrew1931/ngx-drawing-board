import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import {
  BehaviorSubject,
  debounceTime,
  fromEvent,
  map,
  Subscription
} from 'rxjs';
import {
  Rectangle,
  Ellipse,
  Triangle,
  Image,
  BaseShape
} from './shapes';
import {
  IElement,
  EMouseHandle,
  IPoint,
  Shape,
  IDrawElement,
  IOutputEvent,
  IOutputClickEvent,
  IGridConfig,
  IDrawGridConfig,
} from './types';
import {
  convertElementNegativeProps,
  ensureFieldBordersOnResize,
  updateElementOnResize,
  ensureFieldBordersOnDrag,
  isRectangle,
  isCircle,
  detectIfMouseIsOverElement,
  detectCurrentHandle,
  setCursorType,
  isTriangle,
  isImage
} from './utils';


@Component({
  selector: 'ngx-drawing-board',
  template: `
    <div [style.position]="'relative'">
      <canvas
        #canvasBackground
        [style.background]="canvasBackground$ | async"
        [width]="canvasWidth$ | async"
        [height]="canvasHeight$ | async"
      ></canvas>
      <canvas
        #canvas
        [style.background]="'transparent'"
        [width]="canvasWidth$ | async"
        [height]="canvasHeight$ | async"
      ></canvas>
    </div>
  `,
  styles: [
    'canvas { position: absolute; left: 0; top: 0 }'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxDrawingBoard implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() data: IElement[] = [];
  @Input() shape: Shape = 'rectangle';
  @Input() initialElementColor: string = '#ffffff';
  @Input() backgroundColor: string = '#f2f2f2';
  @Input() backgroundImage: string = '';
  @Input() width: number = 600;
  @Input() height: number = 600;
  @Input() fitCanvasToImage: boolean = true;
  @Input() gridConfig: IGridConfig = { enabled: true };

  @Output() onAddElement = new EventEmitter<IOutputEvent>();
  @Output() onClickElement = new EventEmitter<IOutputClickEvent>();
  @Output() onFocusElement = new EventEmitter<IOutputEvent>();
  @Output() onBlurElement = new EventEmitter<IOutputEvent>();
  @Output() onMouseEnterElement = new EventEmitter<IOutputEvent>();
  @Output() onMouseLeaveElement = new EventEmitter<IOutputEvent>();
  @Output() onResizeStart = new EventEmitter<IOutputEvent>();
  @Output() onResizing = new EventEmitter<IOutputEvent>();
  @Output() onResizeEnd = new EventEmitter<IOutputEvent>();
  @Output() onDragStart = new EventEmitter<IOutputEvent>();
  @Output() onDragging = new EventEmitter<IOutputEvent>();
  @Output() onDragEnd = new EventEmitter<IOutputEvent>();


  @ViewChild('canvasBackground') canvasBackgroundEl: ElementRef<HTMLCanvasElement> | undefined;
  @ViewChild('canvas') canvasEl: ElementRef<HTMLCanvasElement> | undefined;

  public canvasWidth$: BehaviorSubject<number> = new BehaviorSubject(0);
  public canvasHeight$: BehaviorSubject<number> = new BehaviorSubject(0);
  public canvasBackground$: BehaviorSubject<string> = new BehaviorSubject('');

  private canvasBackground: HTMLCanvasElement | undefined;
  private canvas: HTMLCanvasElement | undefined;

  private readonly minElementSize = 5;

  private newElement: IElement = this.emptyElement;
  private elements: IElement[] = [];

  private mouseEnterElementIndex: number = -1;
	private draggableElementIndex: number = -1;
	private resizableElementIndex: number = -1;
  private selectedElementIndex: number = -1;
  private mouseCoords: IPoint = { x: 0, y: 0 };
	private mouseIsDown: boolean = false;
  private dragStarted: boolean = false;
  private resizeStarted: boolean = false;
	private shadowOnHoveredElement: boolean = false;
  private currentHandle: EMouseHandle | false = false;

  get ctxBackground(): CanvasRenderingContext2D | null {
    return this.canvasBackground ? this.canvasBackground.getContext('2d') : null;
  };

  get ctx(): CanvasRenderingContext2D | null {
		return this.canvas ? this.canvas.getContext('2d') : null;
	};

	get canvasX(): number {
		return this.canvas?.getBoundingClientRect()?.left || 0;
	};

	get canvasY(): number {
		return this.canvas?.getBoundingClientRect()?.top || 0;
	};

	get emptyElement(): IElement {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      shape: this.shape,
      color: this.initialElementColor,
    };
	};

  private subscriptions = new Subscription();

  constructor(
    private readonly zone: NgZone,
    private baseShape: BaseShape,
    private rectangle: Rectangle,
    private ellipse: Ellipse,
    private triangle: Triangle,
    private image: Image
  ) {}

  /**
  * Re-draw all elements when `this.elements` list changes
  */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.canvas) {
      if (changes.gridConfig) {
        this.drawElements();
        this.drawCanvasGrid();
      }

      if (changes.data) {
        this.elements = [...changes.data.currentValue];
        this.drawElements();
      }
    }
  };

  /**
  * Init canvas size and background
  */
  ngOnInit(): void {
    if (this.data) {
      this.elements = [...this.data];
    }
    this.setCanvasSizeAndBackground();
  };

  /**
  * Init newElement and canvas properties, draw initial elements, grid, set event listeners
  */
  ngAfterViewInit(): void {
    this.newElement = this.emptyElement;
    this.canvas = this.canvasEl?.nativeElement;
    this.canvasBackground = this.canvasBackgroundEl?.nativeElement;

    this.drawElements();

    this.drawCanvasGrid();

    this.initEventsSubscriptions();
  };

  /**
  * Remove event listeners
  */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  };

  /**
  * Init mousedown, mouseup, mousemove event listeners
  */
  private initEventsSubscriptions(): void {
    if (!this.canvas) { return }
    const canvasMouseDown$ = fromEvent(this.canvas, 'mousedown');
    const canvasMouseMove$ = fromEvent(this.canvas, 'mousemove');
    const windowMouseMove$ = fromEvent(window, 'mousemove');
    const windowMouseUp$ = fromEvent(window, 'mouseup');

    this.zone.runOutsideAngular(() => {
      this.subscriptions.add(
        canvasMouseDown$.pipe(map((e: any) => e)).subscribe(this.mouseDownListener)
      );

      this.subscriptions.add(
        windowMouseUp$.pipe(map((e: any) => e)).subscribe(this.mouseUpListener)
      );

      this.subscriptions.add(
        canvasMouseMove$.pipe(
          map((e: any) => e),
          debounceTime(8)
        )
        .subscribe(this.handleMouseMovement)
      );

      this.subscriptions.add(
        windowMouseMove$.pipe(
          map((e: any) => e),
          debounceTime(5)
        )
        .subscribe(this.mouseMoveListener)
      );
    });
  }

  /**
  * Handle canvas mouse up
  */
	mouseUpListener = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

		this.mouseIsDown = false;

    // end of resizing
		if (this.resizableElementIndex >= 0) {
			let targetEl = this.elements[this.resizableElementIndex]
			this.elements[this.resizableElementIndex] = convertElementNegativeProps(targetEl);
      this.zone.run(() => {
        this.onResizeEnd.emit(this.getOutputParams(this.resizableElementIndex));
        this.resizeStarted = false;
      });
		}

    // end of dragging
    if (this.draggableElementIndex >= 0) {
      this.zone.run(() => {
        if (this.dragStarted) {
          this.onDragEnd.emit(this.getOutputParams(this.draggableElementIndex));
          this.dragStarted = false;
        }
      });
    }

    // end of drawing
		if (this.draggableElementIndex < 0 && this.resizableElementIndex < 0) {
			const newElem = convertElementNegativeProps({ ...this.newElement });
			if (newElem.width > this.minElementSize && newElem.height > this.minElementSize) {
				this.elements.push(newElem);
        this.zone.run(() => {
          this.onAddElement.emit(this.getOutputParams(this.elements.length - 1));
        });
			}
		}
    this.newElement = this.emptyElement;
    this.drawElements();
	};

  /**
   * Handle canvas mouse down
   * @param e
   */
	mouseDownListener = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    const { x, y } = this.getMouseCoords(e);
		this.newElement.x = x;
		this.newElement.y = y;
		this.mouseIsDown = true;
    if (this.draggableElementIndex >= 0) {

      if (this.selectedElementIndex >= 0) {
        this.zone.run(() => {
          this.onBlurElement.emit(this.getOutputParams(this.selectedElementIndex));
        });
      }

      this.zone.run(() => {
        this.onClickElement.emit({
          ...this.getOutputParams(this.draggableElementIndex),
          clickCoords: { x: e.clientX, y: e.clientY }
        });
      });

      if (this.selectedElementIndex !== this.draggableElementIndex) {
        this.selectedElementIndex = this.draggableElementIndex;
        this.zone.run(() => {
          this.onFocusElement.emit(this.getOutputParams(this.selectedElementIndex));
        });
      }
    } else {
      if (this.selectedElementIndex >= 0) {
        this.zone.run(() => {
          this.onBlurElement.emit(this.getOutputParams(this.selectedElementIndex));
        });
      }

      this.selectedElementIndex = -1;
    }
    this.drawElements();
	};

  /**
   * Handle canvas mouse movement during drawing, resizing, draging
   * @param e
   */
	mouseMoveListener = (e: MouseEvent): void => {
    if (!this.mouseIsDown) {
      return;
	  }

    e.preventDefault();
    e.stopPropagation();

    this.mouseCoords = this.getMouseCoords(e);

    ensureFieldBordersOnResize(this.mouseCoords, this.canvasWidth$.value, this.canvasHeight$.value);

    this.newElement.width = this.mouseCoords.x - this.newElement.x;
    this.newElement.height = this.mouseCoords.y - this.newElement.y;

    // resize existing element
    if (this.resizableElementIndex >= 0) {

      if (!this.resizeStarted) {
        this.onResizeStart.emit(this.getOutputParams(this.resizableElementIndex));
        this.resizeStarted = true;
      } else {
        this.zone.run(() => {
          this.onResizing.emit(this.getOutputParams(this.resizableElementIndex));
        });
      }

      const targetEl = this.elements[this.resizableElementIndex];

      this.elements[this.resizableElementIndex] = updateElementOnResize(this.currentHandle, this.mouseCoords, targetEl);

      this.drawElements();
    }
    // drag existing element
    else if (this.draggableElementIndex >= 0) {
      const { width, height } = this.newElement;

      if (
        (width === 0 && height === 0) ||
        (width === -1 && height === 0) ||
        (width === 1 && height === 0) ||
        (width === 0 && height === -1) ||
        (width === 0 && height === 1)
      ) {
        return;
      }

      if (!this.dragStarted) {
        this.zone.run(() => {
          this.onDragStart.emit(this.getOutputParams(this.draggableElementIndex));
        });
        this.dragStarted = true;
      } else {
        this.zone.run(() => {
          this.onDragging.emit(this.getOutputParams(this.draggableElementIndex));
        });
      }

      const targetEl = this.elements[this.draggableElementIndex];
      targetEl.x += width;
      targetEl.y += height;

      ensureFieldBordersOnDrag(targetEl, this.canvasWidth$.value, this.canvasHeight$.value);

      this.drawElements();

      this.newElement.x = this.mouseCoords.x;
      this.newElement.y = this.mouseCoords.y;
    }
    // draw new element
    else {
      const newElementProps = { ctx: this.ctx, elem: this.newElement };
      this.drawElements();
      this.drawElement(newElementProps);
    }
	};

  /**
  * Draw all elements from `this.elements` list
  */
	drawElements = (): void => {
		this.baseShape.clearField(this.ctx, this.canvasWidth$.value, this.canvasHeight$.value);

		for (let [index, elem] of this.elements.entries()) {
      const drawProps = {
        ctx: this.ctx,
        elem,
        fill: true,
        isHovered: this.draggableElementIndex === index
      };

      this.drawElement(drawProps);

      if (index === this.selectedElementIndex) {
        this.baseShape.drawHandles({ ctx: this.ctx, elem });
      }
		}
  };

  /**
  * Draw new element
  */
  drawElement = (props: IDrawElement): void => {
    if (isImage(props.elem)) {
      this.image.drawElement(props);
      return;
    }

    if (isRectangle(props.elem)) {
      this.rectangle.drawElement(props);
      return;
    }

    if (isCircle(props.elem)) {
      this.ellipse.drawElement(props);
      return;
    }

    if (isTriangle(props.elem)) {
      this.triangle.drawElement(props);
      return;
    }
  };

  /**
   * Draw canvas grid
   */
  drawCanvasGrid = (): void => {
    const defaultGridConfig: IDrawGridConfig = {
      enabled: true,
      cellSize: 12,
      strokeWidth: .3,
      strokeColor: '#000000'
    };

    const gridConfig = Object.assign(defaultGridConfig, this.gridConfig);

    if (!gridConfig.enabled) {
      return;
    }

    this.baseShape.drawGrid(
      this.ctxBackground,
      gridConfig,
      this.canvasWidth$.value,
      this.canvasHeight$.value
    );
  };

  /**
   * Handle canvas mouse movement when mouse is up
   * @param e
   */
  handleMouseMovement = (e: MouseEvent): void => {
  	if (this.mouseIsDown) {
      return;
    }

    this.draggableElementIndex = -1;
		this.resizableElementIndex = -1;

		const mouseCoords = this.getMouseCoords(e);

		for (let [index, elem] of this.elements.entries()) {

      let mouseIsOverElement = false;

      mouseIsOverElement = detectIfMouseIsOverElement(mouseCoords, elem);
      this.currentHandle = detectCurrentHandle(mouseCoords, elem);
      if (this.currentHandle) {
        this.resizableElementIndex = index;
        this.draggableElementIndex = -1;
				break;
			}

			if (mouseIsOverElement) {
				this.draggableElementIndex = index;
				this.shadowOnHoveredElement = true;
				this.drawElements();
        break;
			}
		}

    if (this.mouseEnterElementIndex < 0 && this.draggableElementIndex >= 0) {
      this.mouseEnterElementIndex = this.draggableElementIndex;
      this.zone.run(() => {
        this.onMouseEnterElement.emit(this.getOutputParams(this.mouseEnterElementIndex));
      });
    }

    if (this.mouseEnterElementIndex >= 0 && this.draggableElementIndex < 0) {
      this.zone.run(() => {
        this.onMouseLeaveElement.emit(this.getOutputParams(this.mouseEnterElementIndex));
      });
      this.mouseEnterElementIndex = -1;
    }

		if (this.draggableElementIndex < 0 && this.shadowOnHoveredElement) {
			this.drawElements();
			this.shadowOnHoveredElement = false;
		}

    setCursorType(this.draggableElementIndex, this.currentHandle);
  };

  /**
  * Set initial canvas size and background
  */
  setCanvasSizeAndBackground(): void {
    this.canvasWidth$.next(this.width);
    this.canvasHeight$.next(this.height);

    if (this.backgroundImage) {
      this.canvasBackground$.next('url('+ this.backgroundImage +')');

      if (this.fitCanvasToImage) {
        const background: any = new Image();
        background.src = this.backgroundImage;
        background.onload = () => {
          this.canvasWidth$.next( background.width);
          this.canvasHeight$.next(background.height);
        }
      }
    } else {
      this.canvasBackground$.next(this.backgroundColor);
    }
  };

  /**
  * Returns params for output event
   * @param targetIndex
   */
  getOutputParams(targetIndex: number): IOutputEvent {
    return {
      index: targetIndex,
      element: this.elements[targetIndex]
    }
  };

  /**
   * Returns coordinates of a mouse
   */
  getMouseCoords(e: MouseEvent): IPoint {
    return {
      x: e.clientX - this.canvasX,
      y: e.clientY - this.canvasY
    }
  };

}
