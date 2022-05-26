import { EMouseHandle, IElement, IPoint } from '../types';

export const getHandlePosition = (currentHandle: EMouseHandle, elem: IElement): IPoint | null => {
  let handlePosition: IPoint | null = null;
  switch (currentHandle) {
    case EMouseHandle.topLeft:
      handlePosition = { x: elem.x, y: elem.y };
      break;
    case EMouseHandle.topRight:
      handlePosition = { x: elem.x + elem.width, y: elem.y };
      break;
    case EMouseHandle.bottomLeft:
      handlePosition = { x: elem.x, y: elem.y + elem.height };
      break;
    case EMouseHandle.bottomRight:
      handlePosition = { x: elem.x + elem.width, y: elem.y + elem.height };
      break;
    case EMouseHandle.top:
      handlePosition = { x: elem.x + elem.width / 2, y: elem.y };
      break;
    case EMouseHandle.left:
      handlePosition = { x: elem.x, y: elem.y + elem.height / 2 };
      break;
    case EMouseHandle.bottom:
      handlePosition = { x: elem.x + elem.width / 2, y: elem.y + elem.height };
      break;
    case EMouseHandle.right:
      handlePosition = { x: elem.x + elem.width, y: elem.y + elem.height / 2 };
      break;
  }
  return handlePosition;
};
