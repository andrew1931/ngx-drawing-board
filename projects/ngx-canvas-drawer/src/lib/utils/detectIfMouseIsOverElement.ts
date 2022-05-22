import { ILayoutElement } from '../types';

export const detectIfMouseIsOverElement = (currentX: number, currentY: number, elem: ILayoutElement): boolean => {
  if (
    currentX > elem.x && currentX < (elem.x + elem.width) &&
    currentY > elem.y && currentY < (elem.y + elem.height)
  ) {
    return true;
  }
  return false;
};
