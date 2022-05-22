import { ILayoutElement } from '../types';

export const isRectangle = (elem: ILayoutElement) => elem.shape === 'rectangle';

export const isCircle = (elem: ILayoutElement) => elem.shape === 'elips';
