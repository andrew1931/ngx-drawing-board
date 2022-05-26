import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { BaseShape } from './base';

@Injectable()
export class Rectangle extends BaseShape {

  override drawElement(props: IDrawElement): void {
    if (props.ctx === null) {
      return;
    }

    props.ctx.setLineDash([]);
    props.ctx.beginPath();
    props.ctx.rect(props.elem.x, props.elem.y, props.elem.width, props.elem.height);

    super.drawElement(props);
	};

}
