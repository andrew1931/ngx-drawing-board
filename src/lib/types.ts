export interface IElement {
	x: number,
	y: number,
	width: number,
	height: number,
  shape: Shape,
  color: string,
  text?: IElementText,
  border?: IElementBorder,
};

export interface IElementText {
  value: string,
  color?: string,
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600,
  fontFamily?: string,
  fontStyle?: string,
  fontSize?: string,
  align?: 'left' | 'center' | 'right',
};

export interface IElementBorder {
  color?: string,
  width?: number,
};

export interface IDrawElement {
	ctx: CanvasRenderingContext2D | null,
	elem: IElement,
	fill?: boolean,
	isHovered?: boolean,
};

export interface IDrawHandle {
	ctx: CanvasRenderingContext2D | null,
	elem: IElement,
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
  center = 'center',
};

export type Shape = 'rectangle' | 'ellips' | 'triangle';
