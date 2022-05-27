import { Injectable } from '@angular/core';
import { IDrawElement } from '../types';
import { Renderer } from '../renderer';

@Injectable()
export class ImageShape {

  constructor(
    private renderer: Renderer
  ) {}

  drawElement(props: IDrawElement): void {
    if (this.renderer.ctx === null) {
      return;
    }
    const { x, y, width, height, imageSrc } = props.elem;

    if (imageSrc) {
      this.renderer.ctx.setLineDash([]);
      this.renderer.ctx.beginPath();
      this.renderer.ctx.drawImage(imageSrc, x, y, width, height);
    }

    this.renderer.drawElement(props);
	};

}
