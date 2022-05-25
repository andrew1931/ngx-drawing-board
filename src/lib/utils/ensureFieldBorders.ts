import { IPoint, IElement } from '../types';

export const ensureFieldBordersOnResize = (mouseCoords: IPoint, fieldWidth: number, fieldHeight: number): void => {
  if (mouseCoords.x > fieldWidth) { mouseCoords.x = fieldWidth; }

  if (mouseCoords.y > fieldHeight) { mouseCoords.y = fieldHeight; }

  if (mouseCoords.x < 0) { mouseCoords.x = 0; }

  if (mouseCoords.y < 0) { mouseCoords.y = 0; }
};

export const ensureFieldBordersOnDrag = (elem: IElement, fieldWidth: number, fieldHeight: number): void => {
  if (elem.x + elem.width > fieldWidth) { elem.x = fieldWidth - elem.width; }

  if (elem.y + elem.height > fieldHeight) { elem.y = fieldHeight - elem.height; }

  if (elem.x < 0) { elem.x = 0; }

  if (elem.y < 0) { elem.y = 0; }
};
