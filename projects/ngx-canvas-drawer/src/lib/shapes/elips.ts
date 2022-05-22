import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { BaseShape } from './base';

@Injectable()
export class Elips extends BaseShape {

  override drawElemet(props: IDrawElement): void {
    if (props.ctx === null) {
      return;
    }
		props.ctx.beginPath();
    const { x, y, width, height } = props.elem;
    const mouseX = width + x;
    const mouseY = height + y;

    props.ctx.moveTo(x, y + (mouseY - y) / 2);
    props.ctx.bezierCurveTo(x, y, mouseX, y, mouseX, y + (mouseY - y) / 2);
    props.ctx.bezierCurveTo(mouseX, mouseY, x, mouseY, x, y + (mouseY - y) / 2);

    super.drawElemet(props);
	};

}
