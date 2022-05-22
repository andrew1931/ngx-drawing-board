export interface ILayoutElement {
	x: number,
	y: number,
	width: number,
	height: number,
  shape: Shape,
  color: string,
};

export interface IDrawElement {
	ctx: CanvasRenderingContext2D | null,
	elem: ILayoutElement,
	fill?: boolean,
	isHovered?: boolean
};

export interface IDrawHandle {
	ctx: CanvasRenderingContext2D | null,
	elem: ILayoutElement,
};

export interface IPoint {
	x: number,
	y: number,
};

export enum EMouseHandle {
	topLeft = 'topLeft',
	topRight = 'topRight',
	bottomLeft = 'bottomLeft',
	bottomRight = 'bottomRight',
	top = 'top',
	left = 'left',
	bottom = 'bottom',
	right = 'right',
};

export type Shape = 'rectangle' | 'elips';
