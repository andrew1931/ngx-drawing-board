import { HANDLE_SIZE } from '../shapes';
import { IPoint, IElement, EMouseHandle } from '../types';
import { getHandlePosition } from './getHandlePosition';

const dist = (p1: IPoint, p2: IPoint): number => {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
};

export const detectCurrentHandle = (mouseCoords: IPoint, elem: IElement): EMouseHandle | false => {
  for (let handle of Object.values(EMouseHandle)) {
    const handlePosition = getHandlePosition(handle, elem);
    if (handlePosition) {
      const target = dist(mouseCoords, handlePosition);
      if (target <= HANDLE_SIZE) {
        return handle;
      }
    }
  }
  return false;
};
