export interface IElement {
	x: number,
	y: number,
	width: number,
	height: number,
  shape: Shape,
  color: string,
  text?: IElementText,
  border?: IElementBorder,
  imageSrc?: CanvasImageSource,
}

export interface IElementText {
  value: string,
  color?: string,
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600,
  fontFamily?: string,
  fontStyle?: string,
  fontSize?: string,
  align?: 'left' | 'center' | 'right',
}

export interface IElementBorder {
  color?: string,
  width?: number,
}

export interface IDrawElement {
	elem: IElement,
	fill?: boolean,
}

export interface IDrawLine {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
}

export interface IPoint {
	x: number,
	y: number,
}

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
}

export type Shape = 'rectangle' | 'ellipse' | 'triangle' | 'image';

export interface IOutputEvent {
  index: number,
  element: IElement
}

export interface IOutputClickEvent extends IOutputEvent {
  clickCoords: IPoint
}

export interface IGridConfig {
  enabled?: boolean,
  cellSize?: number,
  strokeWidth?: number,
  strokeColor?: string,
}

export interface IDrawGridConfig {
  enabled: boolean,
  cellSize: number,
  strokeWidth: number,
  strokeColor: string,
}
