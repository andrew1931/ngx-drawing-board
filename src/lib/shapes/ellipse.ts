import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { Renderer } from '../renderer';

@Injectable()
export class EllipseShape {

  constructor(
    private renderer: Renderer
  ) {}

  drawElement(props: IDrawElement): void {
    if (this.renderer.ctx === null) {
      return;
    }

    const { x, y, width, height } = props.elem;
    const mouseX = width + x;
    const mouseY = height + y;
    const scaleX = ((mouseX - x) / 2);
    const scaleY = ((mouseY - y) / 2);
    const centerX = (x / scaleX) + 1;
    const centerY = (y / scaleY) + 1;

    this.renderer.ctx.setLineDash([]);
    this.renderer.ctx.save();
    this.renderer.ctx.beginPath();
    this.renderer.ctx.scale(scaleX ,scaleY);
    this.renderer.ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
    this.renderer.ctx.restore();

    this.renderer.drawElement(props);
	};

}
