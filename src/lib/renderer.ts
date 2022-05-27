import { EMouseHandle, IDrawElement, IDrawGridConfig, IDrawLine, IElement } from './types';
import { getHandlePosition, isImage } from './utils';
import { Injectable } from '@angular/core';


@Injectable()
export class Renderer {

  private _ctxBackground: CanvasRenderingContext2D | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;

  public get ctx(): CanvasRenderingContext2D | null {
    return this._ctx;
  };

  public handle = {
    defaultColor: '#00B100',
    defaultSize: 5
  };

  protected text = {
    defaultFontWeight: 300,
    defaultFontSize: '28px',
    defaultFontFamily: 'Arial',
    defaultFontStyle: 'normal',
    defaultColor: '#000'
  };

  protected border = {
    defaultWidth: 1,
    defaultColor: '#000',
  };

  public initRenderContexts(canvas: HTMLCanvasElement, canvasBackground: HTMLCanvasElement): void {
    this._ctx = canvas.getContext('2d');
    this._ctxBackground = canvasBackground.getContext('2d');
  };

  public drawElement({ elem, fill = false }: IDrawElement): void {
    const borderWidth = elem.border?.width ?? 0;

    if (borderWidth > 0) {
      this.drawPermanentBorder(elem, borderWidth);
    }

    if (fill) {
      this.fillElement(elem)
    }

    if ((!fill || (fill && elem.color === 'transparent')) && borderWidth === 0) {
      this.drawDashedBorder();
    }

    this.drawText(elem);
	};

  private drawPermanentBorder(elem: IElement, borderWidth: number): void {
    if (this._ctx === null) {
      return;
    }

    const borderColor = elem.border?.color;
    if (borderColor) {
      this._ctx.strokeStyle = borderColor;
      this._ctx.lineWidth = borderWidth;
      if (isImage(elem)) {
        this._ctx.strokeRect(elem.x, elem.y, elem.width, elem.height);
      } else {
        this._ctx.stroke();
      }
    }
  };

  drawDashedBorder(): void {
    if (this._ctx === null) {
      return;
    }

    this._ctx.setLineDash([5, 3]);
    this._ctx.strokeStyle = this.border.defaultColor;
    this._ctx.lineWidth = this.border.defaultWidth;
    this._ctx.stroke();
  };

  private fillElement(elem: IElement): void {
    if (this._ctx === null) {
      return;
    }

    this._ctx.fillStyle = elem.color;
    this._ctx.fill();
  };

  private drawText(elem: IElement): void {
    if (this._ctx === null) {
      return;
    }

    if (elem.text && elem.text.value) {
      const { value, fontWeight, fontSize, fontFamily, fontStyle, color, align } = elem.text;
      const { defaultColor, defaultFontFamily, defaultFontSize, defaultFontStyle, defaultFontWeight } = this.text;

      this._ctx.font = (fontStyle || defaultFontStyle) + ' ' + (fontWeight || defaultFontWeight) + ' ' + (fontSize || defaultFontSize) + ' ' + (fontFamily || defaultFontFamily);
      this._ctx.fillStyle = color || defaultColor;
      this._ctx.textBaseline = 'middle';

      let textX = elem.x + (elem.width / 2);
      let textY = elem.y + (elem.height / 2);

      if (!align || align === 'center') {
        this._ctx.textAlign = 'center';
      }

      if (align === 'left') {
        textX = elem.x;
        this._ctx.textAlign = 'left';
      }

      if (align === 'right') {
        textX = elem.x + elem.width;
        this._ctx.textAlign = 'right';
      }

      this._ctx.fillText(value, textX, textY);
    }
  };

  public clearField(width: number, height: number): void {
    if (this._ctx) {
      this._ctx.clearRect(0, 0, width, height);
    }
  };

  public drawGrid(gridConfig: IDrawGridConfig, width: number, height: number): void {
    if (this._ctxBackground === null) {
      return;
    }
    // Anti-aliasing fix. This makes the lines look crisp and sharp
    this._ctxBackground.translate(0.5, 0.5);

    const drawLine = ({ startX, startY, endX, endY }: IDrawLine): void => {
      if (this._ctxBackground === null) {
        return;
      }

      this._ctxBackground.beginPath();
      this._ctxBackground.moveTo(startX, startY);
      this._ctxBackground.lineTo(endX, endY);
      this._ctxBackground.strokeStyle = strokeColor;
      this._ctxBackground.lineWidth = strokeWidth;
      this._ctxBackground.stroke();
    }

    const { cellSize, strokeColor, strokeWidth } = gridConfig;
    let currentY = 0;
    while (currentY < height) {
      drawLine({
        startX: 0,
        startY: currentY + cellSize,
        endX: width,
        endY: currentY + cellSize,
      });
      currentY += cellSize;
    }

    let currentX = 0;
    while (currentX < width) {
      drawLine({
        startX: currentX + cellSize,
        startY: 0,
        endX: currentX + cellSize,
        endY: height
      });
      currentX += cellSize;
    }
  };

  public drawHandles(elem: IElement): void {
    if (this._ctx === null) {
      return;
    }
		for (const handleType of Object.values(EMouseHandle)) {
			const handle = getHandlePosition(handleType, elem);
      if (handle) {
        this._ctx.fillStyle = this.handle.defaultColor;
        this._ctx.beginPath();
        this._ctx.arc(handle.x, handle.y, this.handle.defaultSize, 0, 2 * Math.PI);
        this._ctx.fill();
      }
		}
	};

}
