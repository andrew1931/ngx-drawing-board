export interface ILayoutElement {
	x: number,
	y: number,
	width: number,
	height: number,
  shape: Shape,
  color: string,
  text?: ILayoutElementText,
};

export interface ILayoutElementText {
  value: string,
  color?: string,
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600,
  fontFamily?: string,
  fontStyle?: string,
  fontSize?: string,
  align?: 'left' | 'center' | 'right',
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

export type Shape = 'rectangle' | 'ellips';
