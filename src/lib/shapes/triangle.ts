import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { BaseShape } from './base';

@Injectable()
export class Triangle extends BaseShape {

  override drawElement(props: IDrawElement): void {
    if (props.ctx === null) {
      return;
    }

    const { x, y, width, height } = props.elem;
    const mouseX = width + x;
    const mouseY = height + y;

    props.ctx.beginPath();
    props.ctx.lineWidth = 1;
    props.ctx.moveTo(x + (mouseX - x) / 2, y);
    props.ctx.lineTo(x, mouseY);
    props.ctx.lineTo(mouseX, mouseY);
    props.ctx.lineTo(x + (mouseX - x) / 2, y);
    props.ctx.closePath();

    super.drawElement(props);
  };

}
