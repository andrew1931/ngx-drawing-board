import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { BaseShape } from './base';

@Injectable()
export class Ellipse extends BaseShape {

  override drawElement(props: IDrawElement): void {
    if (props.ctx === null) {
      return;
    }

    const { x, y, width, height } = props.elem;
    const mouseX = width + x;
    const mouseY = height + y;

    const scaleX = ((mouseX - x) / 2);
    const scaleY = ((mouseY - y) / 2);
    const centerX = (x / scaleX) + 1;
    const centerY = (y / scaleY) + 1;
    props.ctx.save();
		props.ctx.beginPath();
    props.ctx.scale(scaleX ,scaleY);
    props.ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
    props.ctx.restore();

    super.drawElement(props);
	};

}
