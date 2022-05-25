import { IElement, IPoint } from '../types';

export const detectIfMouseIsOverElement = (mouseCoords: IPoint, elem: IElement): boolean => {
  if (
    mouseCoords.x > elem.x && mouseCoords.x < (elem.x + elem.width) &&
    mouseCoords.y > elem.y && mouseCoords.y < (elem.y + elem.height)
  ) {
    return true;
  }
  return false;
};
