import { IElement } from '../types';

export const ensureGridStep = (elem: IElement, step: number) => {
  const remainderX = elem.x % step;
  const remainderY = elem.y % step;
  const remainderWidth = elem.width % step;
  const remainderHeight = elem.height % step;

  if (remainderX > 0) {
    elem.x = (remainderX >= step / 2) ? (elem.x + step - remainderX) : elem.x - remainderX;
  }

  if (remainderY > 0) {
    elem.y = (remainderY >= step / 2) ? (elem.y + step - remainderY) : elem.y - remainderY;
  }

  if (remainderWidth > 0) {
    elem.width -= remainderWidth;
  }

  if (remainderHeight > 0) {
    elem.height -= remainderHeight;
  }
}
