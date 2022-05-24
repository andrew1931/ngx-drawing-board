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
import { Rectangle, Ellips, Triangle } from './shapes';
import { IElement, EMouseHandle, IPoint, Shape, IDrawElement } from './types';
import {
  convertElemntNegativeProps,
  ensureFieldBordersOnResize,
  updateElementOnResize,
  ensureFieldBordersOnDrag,
  isRectangle,
  isCircle,
  detectIfMouseIsOverElement,
  detectCurrentHandle,
  setCursorType,
  isTriangle
} from './utils';

@Component({
  selector: 'ngx-drawing-board',
  template: `
    <canvas
      #canvas
      [style.background]="canvasBackgound$ | async"
      [width]="canvasWidth$ | async"
      [height]="canvasHeight$ | async"
    ></canvas>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxDrawingBoard implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() elements: IElement[] = [];
  @Input() shape: Shape = 'rectangle';
  @Input() initialElementColor: string = '#ffffff';
  @Input() backgroundColor: string = '#f2f2f2';
  @Input() backgroundImage: string = '';
  @Input() width: number = 600;
  @Input() height: number = 600;
  @Input() fitCanvasToImage: boolean = true;

  @Output() onAddElement = new EventEmitter<IElement>();
  @Output() onClickElement = new EventEmitter<{ index: number, clickCoords: IPoint }>();
  @Output() onFocusElement = new EventEmitter<number>();
  @Output() onBlurElement = new EventEmitter<number>();
  @Output() onMouseEnterElement = new EventEmitter<number>();
  @Output() onMouseLeaveElement = new EventEmitter<number>();
  @Output() onResizeStart = new EventEmitter<number>();
  @Output() onResizing = new EventEmitter<number>();
  @Output() onResizeEnd = new EventEmitter<number>();
  @Output() onDragStart = new EventEmitter<number>();
  @Output() onDraging = new EventEmitter<number>();
  @Output() onDragEnd = new EventEmitter<number>();


  @ViewChild('canvas') canvasEl: ElementRef<HTMLCanvasElement>;

  public canvasWidth$: BehaviorSubject<number> = new BehaviorSubject(0);
  public canvasHeight$: BehaviorSubject<number> = new BehaviorSubject(0);
  public canvasBackgound$: BehaviorSubject<string> = new BehaviorSubject('');

  private canvas: HTMLCanvasElement;

  private readonly minElementSize = 5;

  private newElement: IElement;

  private mouseEnterElementIndex: number = -1;
	private dragableElementIndex: number = -1;
	private resizableElementIndex: number = -1;
  private selectedElementIndex: number = -1;
  private mouseCoords: IPoint = { x: 0, y: 0 };
	private mouseIsDown: boolean = false;
  private dragStarted: boolean = false;
  private resizeStarted: boolean = false;
	private shadowOnHoveredElement: boolean = false;
  private currentHandle: EMouseHandle | false = false;


  get ctx(): CanvasRenderingContext2D | null {
		return this.canvas.getContext('2d');
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
      color: this.initialElementColor
    };
	};

  private subscriptions = new Subscription();

  constructor(
    private readonly zone: NgZone,
    private rectangle: Rectangle,
    private ellips: Ellips,
    private triangle: Triangle
  ) {}

  /**
  * Re-draw all elements when `this.elements` list changes
  */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.elements && this.canvas) {
      this.drawElemets();
    }
  };

  /**
  * Init canvas size and background
  */
  ngOnInit(): void {
    this.setCanvasSizeAndBackground();
  };

  /**
  * Init newElement and canvas properties, draw initial elemets, set event listeners
  */
  ngAfterViewInit(): void {
    this.newElement = this.emptyElement;
    this.canvas = this.canvasEl.nativeElement;

    this.drawElemets();

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
			let targeEl = this.elements[this.resizableElementIndex]
			this.elements[this.resizableElementIndex] = convertElemntNegativeProps(targeEl);
      this.zone.run(() => {
        this.onResizeEnd.emit(this.resizableElementIndex);
        this.resizeStarted = false;
      });
		}

    // end of draging
    if (this.dragableElementIndex >= 0) {
      this.zone.run(() => {
        if (this.dragStarted) {
          this.onDragEnd.emit(this.dragableElementIndex);
          this.dragStarted = false;
        }
      });
    }

    // end of drawing
		if (this.dragableElementIndex < 0 && this.resizableElementIndex < 0) {
			const newElem = convertElemntNegativeProps({...this.newElement});
			if (newElem.width > this.minElementSize && newElem.height > this.minElementSize) {
				this.elements.push(newElem);
        this.zone.run(() => {
          this.onAddElement.emit(newElem);
        });
        this.newElement = this.emptyElement;
			}
		}
    this.drawElemets();
	};

  /**
  * Handle canvas mouse down
  * @param mouseEvent
  */
	mouseDownListener = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

		this.newElement.x = e.clientX - this.canvasX;
		this.newElement.y = e.clientY - this.canvasY;
		this.mouseIsDown = true;
    if (this.dragableElementIndex >= 0) {

      if (this.selectedElementIndex >= 0) {
        this.zone.run(() => {
          this.onBlurElement.emit(this.selectedElementIndex);
        });
      }

      this.zone.run(() => {
        this.onClickElement.emit({ index: this.dragableElementIndex, clickCoords: { x: e.clientX, y: e.clientY } });
      });

      if (this.selectedElementIndex !== this.dragableElementIndex) {
        this.selectedElementIndex = this.dragableElementIndex;
        this.zone.run(() => {
          this.onFocusElement.emit(this.selectedElementIndex);
        });
      }
    } else {
      if (this.selectedElementIndex >= 0) {
        this.zone.run(() => {
          this.onBlurElement.emit(this.selectedElementIndex);
        });
      }

      this.selectedElementIndex = -1;
    }
    this.drawElemets();
	};

  /**
  * Handle canvas mouse movement during drawing, resizing, draging
  * @param mouseEvent
  */
	mouseMoveListener = (e: MouseEvent): void => {
    if (!this.mouseIsDown) {
      return;
	  }

    e.preventDefault();
    e.stopPropagation();

    this.mouseCoords = ensureFieldBordersOnResize(
      e.clientX - this.canvasX,
      e.clientY - this.canvasY,
      this.canvasWidth$.value,
      this.canvasHeight$.value
    );

    this.newElement.width = this.mouseCoords.x - this.newElement.x;
    this.newElement.height = this.mouseCoords.y - this.newElement.y;

    // resize existing element
    if (this.resizableElementIndex >= 0) {

      if (!this.resizeStarted) {
        this.onResizeStart.emit(this.resizableElementIndex);
        this.resizeStarted = true;
      } else {
        this.zone.run(() => {
          this.onResizing.emit(this.resizableElementIndex);
        });
      }

      const targetEl = this.elements[this.resizableElementIndex];
      let resizedEl = updateElementOnResize(this.currentHandle, this.mouseCoords, targetEl);

      this.elements[this.resizableElementIndex] = resizedEl;

      this.drawElemets();
    }
    // drag existing element
    else if (this.dragableElementIndex >= 0) {
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
          this.onDragStart.emit(this.dragableElementIndex);
        });
        this.dragStarted = true;
      } else {
        this.zone.run(() => {
          this.onDraging.emit(this.dragableElementIndex);
        });
      }

      let targetEl = this.elements[this.dragableElementIndex];
      targetEl.x += width;
      targetEl.y += height;

      targetEl = ensureFieldBordersOnDrag(targetEl, this.canvasWidth$.value, this.canvasHeight$.value);

      this.drawElemets();

      this.newElement.x = this.mouseCoords.x;
      this.newElement.y = this.mouseCoords.y;
    }
    // draw new element
    else {
      this.drawElemets();
      this.drawNewElement();
    }
	};

  /**
  * Draw all elements from `this.elements` list
  */
	drawElemets = (): void => {
		this.rectangle.clearFeild(this.ctx, this.canvasWidth$.value, this.canvasHeight$.value);

		for (let [index, elem] of this.elements.entries()) {
      const drawProps = {
        ctx: this.ctx,
        elem,
        fill: true,
        isHovered: this.dragableElementIndex === index
      };

      this.drawNewElement(drawProps);

      if (index === this.selectedElementIndex) {
        this.rectangle.drawHandles({ ctx: this.ctx, elem });
      }
		}
  };

  /**
  * Draw new element
  */
  drawNewElement = (props?: IDrawElement): void => {
    const _props = {
      ctx: this.ctx,
      elem: this.newElement,
    };

    const drawProps = props || _props;

    if (isRectangle(drawProps.elem)) {
      this.rectangle.drawElemet(drawProps);
    }

    if (isCircle(drawProps.elem)) {
      this.ellips.drawElemet(drawProps);
    }

    if (isTriangle(drawProps.elem)) {
      this.triangle.drawElemet(drawProps);
    }

  };

  /**
  * Handle canvas mouse movement when mouse is up
  * @param mouseEvent
  */
  handleMouseMovement = (e: MouseEvent): void => {
  	if (this.mouseIsDown) {
      return;
    }

    this.dragableElementIndex = -1;
		this.resizableElementIndex = -1;

		const currentX = e.clientX - this.canvasX;
		const currentY = e.clientY - this.canvasY;

		for (let [index, elem] of this.elements.entries()) {

      let mouseIsOverElement = false;

      mouseIsOverElement = detectIfMouseIsOverElement(currentX, currentY, elem);
      this.currentHandle = detectCurrentHandle({ x: currentX, y: currentY }, elem);
      if (this.currentHandle) {
        this.resizableElementIndex = index;
        this.dragableElementIndex = -1;
				break;
			}

			if (mouseIsOverElement) {
				this.dragableElementIndex = index;
				this.shadowOnHoveredElement = true;
				this.drawElemets();
        break;
			}
		}

    if (this.mouseEnterElementIndex < 0 && this.dragableElementIndex >= 0) {
      this.mouseEnterElementIndex = this.dragableElementIndex;
      this.zone.run(() => {
        this.onMouseEnterElement.emit(this.mouseEnterElementIndex);
      });
    }

    if (this.mouseEnterElementIndex >= 0 && this.dragableElementIndex < 0) {
      this.zone.run(() => {
        this.onMouseLeaveElement.emit(this.mouseEnterElementIndex);
      });
      this.mouseEnterElementIndex = -1;
    }

		if (this.dragableElementIndex < 0 && this.shadowOnHoveredElement) {
			this.drawElemets();
			this.shadowOnHoveredElement = false;
		}

    setCursorType(this.dragableElementIndex, this.currentHandle);
  };

  /**
  * Set initial canvas size and background
  */
  setCanvasSizeAndBackground(): void {
    this.canvasWidth$.next(this.width);
    this.canvasHeight$.next(this.height);

    if (this.backgroundImage) {
      this.canvasBackgound$.next('url('+ this.backgroundImage +')');

      if (this.fitCanvasToImage) {
        const background = new Image();
        background.src = this.backgroundImage;
        background.onload = () => {
          this.canvasWidth$.next( background.width);
          this.canvasHeight$.next(background.height);
        }
      }
    } else {
      this.canvasBackgound$.next(this.backgroundColor);
    }
  }

}
