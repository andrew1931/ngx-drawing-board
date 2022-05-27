import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { Renderer } from '../renderer';

@Injectable()
export class TriangleShape {

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

    this.renderer.ctx.setLineDash([]);
    this.renderer.ctx.beginPath();
    this.renderer.ctx.lineWidth = 1;
    this.renderer.ctx.moveTo(x + (mouseX - x) / 2, y);
    this.renderer.ctx.lineTo(x, mouseY);
    this.renderer.ctx.lineTo(mouseX, mouseY);
    this.renderer.ctx.lineTo(x + (mouseX - x) / 2, y);
    this.renderer.ctx.closePath();

    this.renderer.drawElement(props);
  };

}
