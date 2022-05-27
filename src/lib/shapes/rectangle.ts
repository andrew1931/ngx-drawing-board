import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { Renderer } from '../renderer';

@Injectable()
export class RectangleShape {

  constructor(
    private renderer: Renderer
  ) {}

  drawElement(props: IDrawElement): void {
    if (this.renderer.ctx === null) {
      return;
    }

    this.renderer.ctx.setLineDash([]);
    this.renderer.ctx.beginPath();
    this.renderer.ctx.rect(props.elem.x, props.elem.y, props.elem.width, props.elem.height);

    this.renderer.drawElement(props);
	};

}
