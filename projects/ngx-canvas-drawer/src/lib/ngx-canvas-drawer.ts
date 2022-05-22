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
import { BehaviorSubject } from 'rxjs';
import { Rectangle, Elips } from './shapes';
import { ILayoutElement, EMouseHandle, IPoint, Shape } from './types';
import {
  convertElemntNegativeProps,
  ensureFieldBordersOnResize,
  updateElementOnResize,
  ensureFieldBordersOnDrag,
  isRectangle,
  isCircle,
  detectIfMouseIsOverElement,
  detectCurrentHandle,
  setCursorType
} from './utils';

@Component({
  selector: 'ngx-canvas-drawer',
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
export class NgxCanvasDrawer implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() shape: Shape = 'rectangle';
  @Input() fitCanvasToImage: boolean = true;
  @Input() backgroundColor: string = '#f2f2f2';
  @Input() backgroundImage: string = '';
  @Input() width: number = 600;
  @Input() height: number = 600;
  @Input() elements: ILayoutElement[] = [];

  @Output() onAddElement = new EventEmitter<ILayoutElement>();
  @Output() onFocusElement = new EventEmitter<number>();
  @Output() onBlurElement = new EventEmitter<number>();
  @Output() onMouseEnterElement = new EventEmitter<number>();
  @Output() onMouseLeaveElement = new EventEmitter<number>();
  @Output() onResizeEnd = new EventEmitter<void>();
  @Output() onDragEnd = new EventEmitter<void>();

  @ViewChild('canvas') canvasEl: ElementRef<HTMLCanvasElement>;

  public canvasWidth$: BehaviorSubject<number> = new BehaviorSubject(0);
  public canvasHeight$: BehaviorSubject<number> = new BehaviorSubject(0);
  public canvasBackgound$: BehaviorSubject<string> = new BehaviorSubject('');

  private canvas: HTMLCanvasElement;

  private readonly minElementSize = 10;

  private newElement: ILayoutElement;

  private mouseEnterElementIndex: number = -1;
	private dragableElementIndex: number = -1;
	private resizableElementIndex: number = -1;
  private selectedElementIndex: number = -1;
  private mouseCoords: IPoint = { x: 0, y: 0 };
	private mouseIsDown: boolean = false;
	private shadowOnHoveredElement: boolean = false;
  private currentHandle: EMouseHandle | false = false;


  get ctx(): CanvasRenderingContext2D | null {
		return this.canvas.getContext('2d');
	};

	get canvasX(): number {
		return this.canvas.offsetLeft;
	};

	get canvasY(): number {
		return this.canvas.offsetTop;
	};

	get emptyElement(): ILayoutElement {
		return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      shape: this.shape,
      color: '#ffffff'
    };
	};

  constructor(
    private readonly zone: NgZone,
    private rectangle: Rectangle,
    private elips: Elips
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.elements && this.canvas) {
      this.drawElemets();
    }
  };

  ngOnInit(): void {
    this.setCanvasSizeAndBackground();
  };

  ngAfterViewInit(): void {
    this.newElement = this.emptyElement;
    this.canvas = this.canvasEl.nativeElement;

    this.drawElemets();

    this.zone.runOutsideAngular(() => {
      this.canvas.addEventListener('mousedown', this.mouseDownListener);
      this.canvas.addEventListener('mousemove', this.handleMouseMovement);
      window.addEventListener('mousemove', this.mouseMoveListener);
      window.addEventListener('mouseup', this.mouseUpListener);
    });
  };

  ngOnDestroy(): void {
    this.canvas.removeEventListener('mousedown', this.mouseDownListener);
    this.canvas.removeEventListener('mousemove', this.handleMouseMovement);
    window.removeEventListener('mousemove', this.mouseMoveListener);
    window.removeEventListener('mouseup', this.mouseUpListener);
  };

	mouseUpListener = (e: MouseEvent): void => {
    console.log('up')
    e.preventDefault();
    e.stopPropagation();

		this.mouseIsDown = false;

    // end of resizing
		if (this.resizableElementIndex >= 0) {
			let targeEl = this.elements[this.resizableElementIndex]
			this.elements[this.resizableElementIndex] = convertElemntNegativeProps(targeEl);
      this.onResizeEnd.emit();
		}

    // end of draging
    if (this.dragableElementIndex >= 0) {
      this.onDragEnd.emit();
    }

    // end of drawing
		if (this.dragableElementIndex < 0 && this.resizableElementIndex < 0) {
			const newElem = convertElemntNegativeProps({...this.newElement});
			if (newElem.width > this.minElementSize && newElem.height > this.minElementSize) {
				this.elements.push(newElem);
        this.onAddElement.emit(newElem);
        this.newElement = this.emptyElement;
        this.drawElemets();
        console.log(this.elements)
			}
		}
	};

	mouseDownListener = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

		this.newElement.x = e.clientX - this.canvasX;
		this.newElement.y = e.clientY - this.canvasY;
		this.mouseIsDown = true;
    if (this.dragableElementIndex >= 0) {
      this.selectedElementIndex = this.dragableElementIndex;
      this.onFocusElement.emit(this.selectedElementIndex);
    } else {
      this.selectedElementIndex = -1;
      this.onBlurElement.emit(this.selectedElementIndex);
    }
    this.drawElemets();
	};

	mouseMoveListener = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();

		if (this.mouseIsDown) {
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
				const targetEl = this.elements[this.resizableElementIndex];
        let resizedEl = updateElementOnResize(this.currentHandle, this.mouseCoords, targetEl);

				this.elements[this.resizableElementIndex] = resizedEl;

				this.drawElemets();
			}
			// drag existing element
			else if (this.dragableElementIndex >= 0) {
				let targetEl = this.elements[this.dragableElementIndex];
				targetEl.x += this.newElement.width;
				targetEl.y += this.newElement.height;

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
	  }
	};

	drawElemets = (): void => {
		this.rectangle.clearFeild(this.ctx, this.canvasWidth$.value, this.canvasHeight$.value);

		for (let [index, elem] of  this.elements.entries()) {
      const drawProps = {
        ctx: this.ctx,
        elem,
        fill: true,
        isHovered: this.dragableElementIndex === index
      };

      if (isRectangle(elem)) {
        this.rectangle.drawElemet(drawProps);
      }

      if (isCircle(elem)) {
        this.elips.drawElemet(drawProps);
      }

      if (index === this.selectedElementIndex) {
        this.rectangle.drawHandles({ ctx: this.ctx, elem });
      }
		}
  };

  drawNewElement = (): void => {
    const drawProps = {
      ctx: this.ctx,
      elem: this.newElement,
    };

    if (isRectangle(this.newElement)) {
      this.rectangle.drawElemet(drawProps);
    }

    if (isCircle(this.newElement)) {
      this.elips.drawElemet(drawProps);
    }
  };

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
      this.onMouseEnterElement.emit(this.mouseEnterElementIndex);
    }

    if (this.mouseEnterElementIndex >= 0 && this.dragableElementIndex < 0) {
      this.onMouseLeaveElement.emit(this.mouseEnterElementIndex);
      this.mouseEnterElementIndex = -1;
    }

		if (this.dragableElementIndex < 0 && this.shadowOnHoveredElement) {
			this.drawElemets();
			this.shadowOnHoveredElement = false;
		}

    setCursorType(this.dragableElementIndex, this.currentHandle);
  };

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
