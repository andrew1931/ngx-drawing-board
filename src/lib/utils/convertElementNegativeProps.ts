import { IElement } from '../types';

export const convertElementNegativeProps = (elem: IElement): IElement => {
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
