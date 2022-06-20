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
import { Renderer } from './renderer';
import {
  RectangleShape,
  EllipseShape,
  TriangleShape,
  ImageShape,
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
  isImage,
  ensureGridStep,
  validate
} from './utils';


@Component({
  selector: 'ngx-drawing-board',
  template: `
    <div
      [style.position]="'relative'"
      [style.width.px]="canvasWidth$ | async"
      [style.height.px]="canvasHeight$ | async"
      [style.background]="canvasBackground$ | async"
    >
      <canvas
        #canvasBackground
        [width]="canvasWidth$ | async"
        [height]="canvasHeight$ | async"
      ></canvas>
      <canvas
        #canvas
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
export class NgxDrawingBoard implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  @Input() data: IElement[] = [];
  @Input() shape: Shape = 'rectangle';
  @Input() initialElementColor: string = 'transparent';
  @Input() backgroundColor: string = '#ffffff';
  @Input() backgroundImage: string = '';
  @Input() width: number = 600;
  @Input() height: number = 600;
  @Input() fitCanvasToImage: boolean = true;
  @Input() gridConfig: IGridConfig = { enabled: true };
  @Input() gridSizeMouseStep: boolean = false;
  @Input() scrollContainer: HTMLElement | undefined;

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

  public canvasWidth$ = new BehaviorSubject<number>(0);
  public canvasHeight$ = new BehaviorSubject<number>(0);
  public canvasBackground$ = new BehaviorSubject<string>('');
  private _canvasSize$ = new BehaviorSubject<{ width?: number, height?: number } | null>(null);

  private readonly minElementSize = 5;

  private activeElement: IElement = this.emptyElement;
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

  private canvasOffsets: IPoint = { x: 0, y: 0 };

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

  get defaultGridConfig(): IDrawGridConfig {
    return {
      enabled: true,
      cellSize: 12,
      strokeWidth: .3,
      strokeColor: '#000000'
    }
  };

  private subscriptions = new Subscription();

  constructor(
    private readonly zone: NgZone,
    private renderer: Renderer,
    private rectangle: RectangleShape,
    private ellipse: EllipseShape,
    private triangle: TriangleShape,
    private image: ImageShape
  ) {}

  /**
   * Re-draw all elements when `this.elements` list changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.renderer.ctx !== null) {
      if (changes.width || changes.height) {
        this._canvasSize$.next({});
      }

      if (changes.backgroundColor || changes.backgroundImage || changes.fitCanvasToImage) {
        this.setCanvasBackground();
      }

      if (changes.gridConfig) {
        this.drawCanvasGrid();
      }

      if (changes.data) {
        this.elements = [...changes.data.currentValue];
        this.drawElements();
      }

      if (changes.shape) {
        this.activeElement.shape = this.shape;
      }

      if (changes.initialElementColor) {
        this.activeElement.color = this.initialElementColor;
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
    this.subscriptions.add(
      this._canvasSize$.subscribe((val) => {
        if (val) {
          this.setCanvasSize(val.width, val.height);
          setTimeout(() => {
            this.initCanvasProps();
          }, 0)
        }

      })
    );

    this.setCanvasBackground();
  };

  /**
   *  Init canvas props; set event listeners
   */
  ngAfterViewInit(): void {
    this.initEventsSubscriptions();
  };

  /**
   * Remove event listeners
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  };

  /**
   * Init activeElement, canvas properties and render contexts; draw initial elements and grid;
   */
  private initCanvasProps(): void {
    if (this.canvasEl && this.canvasBackgroundEl) {

      const { top, left } = this.canvasEl?.nativeElement.getBoundingClientRect();

      this.canvasOffsets.x = left;
      this.canvasOffsets.y = top;

      this.renderer.initRenderContexts(this.canvasEl.nativeElement, this.canvasBackgroundEl.nativeElement);

      this.activeElement = this.emptyElement;

      this.drawElements();

      this.drawCanvasGrid();

    }
  }

  /**
   * Init mousedown, mouseup, mousemove event listeners
   */
  private initEventsSubscriptions(): void {
    if (!this.canvasEl) { return }

    const canvasMouseRightClick$ = fromEvent(this.canvasEl.nativeElement, 'contextmenu');
    const canvasMouseDown$ = fromEvent(this.canvasEl.nativeElement, 'mousedown');
    const canvasMouseMove$ = fromEvent(this.canvasEl.nativeElement, 'mousemove');
    const windowMouseMove$ = fromEvent(window, 'mousemove');
    const windowMouseUp$ = fromEvent(window, 'mouseup');


    this.zone.runOutsideAngular(() => {
      this.subscriptions.add(
        canvasMouseRightClick$.subscribe((e: any) => e.preventDefault())
      );

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
   *  Handle canvas mouse up
   */
	mouseUpListener = (): void => {

    this.mouseIsDown = false;

    if (
      this.resizableElementIndex < 0 &&
      this.draggableElementIndex < 0 &&
      this.activeElement.width === 0 &&
      this.activeElement.height === 0
    ) {
      return;
    }

    const step = this.gridConfig.cellSize || this.defaultGridConfig.cellSize;

    // end of resizing
		if (this.resizableElementIndex >= 0) {
			let targetEl = this.elements[this.resizableElementIndex]
			this.elements[this.resizableElementIndex] = convertElementNegativeProps(targetEl);

      if (this.gridSizeMouseStep) {
        ensureGridStep(this.elements[this.resizableElementIndex], step);
      }

      this.zone.run(() => {
        this.onResizeEnd.emit(this.getOutputParams(this.resizableElementIndex));
        this.resizeStarted = false;
      });
		}

    // end of dragging
    if (this.draggableElementIndex >= 0) {

      if (this.gridSizeMouseStep) {
        ensureGridStep(this.elements[this.draggableElementIndex], step);
      }

      this.zone.run(() => {
        if (this.dragStarted) {
          this.onDragEnd.emit(this.getOutputParams(this.draggableElementIndex));
          this.dragStarted = false;
        }
      });
    }

    // end of drawing
		if (this.draggableElementIndex < 0 && this.resizableElementIndex < 0) {
			const newElem = convertElementNegativeProps({ ...this.activeElement });

      if (this.gridSizeMouseStep) {
        ensureGridStep(newElem, step);
      }

			if (newElem.width > this.minElementSize && newElem.height > this.minElementSize) {
				this.elements.push(newElem);
        this.zone.run(() => {
          this.onAddElement.emit(this.getOutputParams(this.elements.length - 1));
        });
			}
		}

    this.activeElement = this.emptyElement;
    this.drawElements();
	};

  /**
   * Handle canvas mouse down
   * @param e
   */
	mouseDownListener = (e: MouseEvent): void => {

    const { x, y } = this.getMouseCoords(e);
		this.activeElement.x = x;
		this.activeElement.y = y;
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

    this.mouseCoords = this.getMouseCoords(e);

    ensureFieldBordersOnResize(this.mouseCoords, this.canvasWidth$.value, this.canvasHeight$.value);

    this.activeElement.width = this.mouseCoords.x - this.activeElement.x;
    this.activeElement.height = this.mouseCoords.y - this.activeElement.y;

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
      const { width, height } = this.activeElement;

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

      this.activeElement.x = this.mouseCoords.x;
      this.activeElement.y = this.mouseCoords.y;
    }
    // draw new element
    else {
      const newElementProps = { elem: this.activeElement };
      this.drawElements();
      this.drawElement(newElementProps);
    }
	};

  /**
  * Draw all elements from `this.elements` list
  */
	drawElements = (): void => {
		this.renderer.clearField(this.canvasWidth$.value, this.canvasHeight$.value);

		for (let [index, elem] of this.elements.entries()) {
      const drawProps = {
        elem,
        fill: true,
      };

      this.drawElement(drawProps);

      if (index === this.selectedElementIndex || index === this.draggableElementIndex) {
        this.renderer.drawHandles(elem);
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
    this.renderer.clearBackgroundField(this.canvasWidth$.value, this.canvasHeight$.value);

    this.renderer.toggleBackgroundFieldTranslate();

    const gridConfig = Object.assign(this.defaultGridConfig, this.gridConfig);

    if (!gridConfig.enabled) {
      return;
    }

    this.renderer.drawGrid(
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
      this.currentHandle = detectCurrentHandle(mouseCoords, elem, this.renderer.handle.defaultSize);
      if (this.currentHandle) {
        this.resizableElementIndex = index;
        this.draggableElementIndex = -1;
				break;
			}

			if (mouseIsOverElement) {
				this.draggableElementIndex = index;
				this.shadowOnHoveredElement = true;
				this.drawElements();
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
   * Set initial canvas size
   */
  setCanvasSize(width?: number, height?: number): void {
    const _width = width || this.width;
    const _height = height || this.height;

    validate.size(_width, _height);

    this.canvasWidth$.next(_width);
    this.canvasHeight$.next(_height);
  };

  /**
   * Set initial canvas background
   */
  setCanvasBackground(): void {
    if (this.backgroundImage) {
      this.canvasBackground$.next('url('+ this.backgroundImage +')');

      if (this.fitCanvasToImage) {
        const background = new Image();
        background.src = this.backgroundImage;
        background.onload = () => {
          this._canvasSize$.next({ width: background.width, height: background.height });
        };
      } else {
        this._canvasSize$.next({});
      }
    } else {
      this.canvasBackground$.next(this.backgroundColor);
      this._canvasSize$.next({});
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

    const scrollLeft = this.scrollContainer?.scrollLeft || document.documentElement.scrollLeft ||  document.body.scrollLeft;
    const scrollTop = this.scrollContainer?.scrollTop || document.documentElement.scrollTop ||  document.body.scrollTop;

    return {
      x: e.clientX - this.canvasOffsets.x + Number(scrollLeft),
      y: e.clientY - this.canvasOffsets.y + Number(scrollTop)
    }
  };

}
