import { ILayoutElement } from '../types';

export const convertElemntNegativeProps = (elem: ILayoutElement): ILayoutElement => {
  if (elem.width < 0) {
    elem.x = elem.x + elem.width;
    elem.width = (elem.width * -1);
  }

  if (elem.height < 0) {
    elem.y = elem.y + elem.height;
    elem.height = (elem.height * -1);
  }
  
  return elem;
};
