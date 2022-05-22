import { EMouseHandle } from '../types';

const detectResizeCursor = (handle: EMouseHandle): string => {
  if (!handle) {
    return 'initial';
  }
  switch (handle) {
    case EMouseHandle.bottom:
      return 'ns-resize';
    case EMouseHandle.top:
      return 'ns-resize';
    case EMouseHandle.left:
      return 'ew-resize';
    case EMouseHandle.right:
      return 'ew-resize';
    case EMouseHandle.topLeft:
      return 'nwse-resize';
    case EMouseHandle.bottomRight:
      return 'nwse-resize';
    case EMouseHandle.topRight:
      return 'nesw-resize';
    case EMouseHandle.bottomLeft:
      return 'nesw-resize';
    default:
      return'initial';
  }
};

export const setCursorType = (mouseIsOverElementIndex: number, currentHandle: EMouseHandle | false): void => {
  let cursor = 'initial';
  if (mouseIsOverElementIndex >= 0) {
    cursor = 'grab';
  }

  if (currentHandle) {
    cursor = detectResizeCursor(currentHandle);
  }

  document.body.style.cursor = cursor;
};
