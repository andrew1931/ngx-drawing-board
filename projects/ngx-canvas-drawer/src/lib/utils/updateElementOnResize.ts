import { EMouseHandle, IPoint, ILayoutElement } from '../types';


export const updateElementOnResize = (currentHandle: EMouseHandle | false, mouse: IPoint, elem: ILayoutElement): ILayoutElement => {
  switch (currentHandle) {
    case EMouseHandle.topLeft:
      elem.width += elem.x - mouse.x;
      elem.height += elem.y - mouse.y;
      elem.x = mouse.x;
      elem.y = mouse.y;
      return elem;
    case EMouseHandle.topRight:
      elem.width = mouse.x - elem.x;
      elem.height += elem.y - mouse.y;
      elem.y = mouse.y;
      return elem;
    case EMouseHandle.bottomLeft:
      elem.width += elem.x - mouse.x;
      elem.x = mouse.x;
      elem.height = mouse.y - elem.y;
      return elem;
    case EMouseHandle.bottomRight:
      elem.width = mouse.x - elem.x;
      elem.height = mouse.y - elem.y;
      return elem;
    case EMouseHandle.top:
      elem.height += elem.y - mouse.y;
      elem.y = mouse.y;
      return elem;
    case EMouseHandle.left:
      elem.width += elem.x - mouse.x;
      elem.x = mouse.x;
      return elem;
    case EMouseHandle.bottom:
      elem.height = mouse.y - elem.y;
      return elem;
    case EMouseHandle.right:
      elem.width = mouse.x - elem.x;
      return elem;
    default:
      return elem;
  }
};
