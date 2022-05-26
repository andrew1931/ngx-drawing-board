import { IElement } from '../types';

export const isRectangle = (elem: IElement) => elem.shape === 'rectangle';

export const isCircle = (elem: IElement) => elem.shape === 'ellipse';

export const isTriangle = (elem: IElement) => elem.shape === 'triangle';

export const isImage = (elem: IElement) => elem.shape === 'image';
