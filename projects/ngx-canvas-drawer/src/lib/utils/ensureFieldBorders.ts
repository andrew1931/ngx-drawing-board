import { IPoint, ILayoutElement } from '../types';

export const ensureFieldBordersOnResize = (mouseX: number, mouseY: number, fieldWidth: number, fieldHeight: number): IPoint => {
  if (mouseX > fieldWidth) { mouseX = fieldWidth; }

  if (mouseY > fieldHeight) { mouseY = fieldHeight; }

  if (mouseX < 0) { mouseX = 0; }

  if (mouseY < 0) { mouseY = 0; }

  return { x: mouseX, y: mouseY };
};

export const ensureFieldBordersOnDrag = (elem: ILayoutElement, fieldWidth: number, fieldHeight: number): ILayoutElement => {
  if (elem.x + elem.width > fieldWidth) {
    elem.x = fieldWidth - elem.width;
  }

  if (elem.y + elem.height > fieldHeight) {
    elem.y = fieldHeight - elem.height;
  }

  if (elem.x < 0) { elem.x = 0; }

  if (elem.y < 0) { elem.y = 0; }

  return elem;
};
