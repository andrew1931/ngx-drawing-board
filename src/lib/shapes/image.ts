import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { BaseShape } from './base';

@Injectable()
export class Image extends BaseShape {

  override drawElement(props: IDrawElement): void {
    if (props.ctx === null) {
      return;
    }
    const { x, y, width, height, imageSrc } = props.elem;

    if (imageSrc) {
      props.ctx.setLineDash([]);
      props.ctx.beginPath();
      props.ctx.drawImage(imageSrc, x, y, width, height);
    }

    super.drawElement(props);
	};

}
