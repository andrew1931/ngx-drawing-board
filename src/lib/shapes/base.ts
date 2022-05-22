import { EMouseHandle, IDrawElement, IDrawHandle, ILayoutElement, IPoint } from '../types';

export const HANDLE_SIZE = 5;

export class BaseShape {

  protected fillStyle = '#fff';
  protected handleFillStyle = '#000';

  protected shadow = {
    color: '#ccc',
    blur: 10,
    offsetX: 0,
    offsetY: 0
  };

  protected text = {
    defaultFontWeight: 300,
    defaultFontSize: '18px',
    defaultFontFamily: 'Arial',
    defaultFontStyle: 'normal',
    defaultColor: '#000'
  };

  protected border = {
    defaultWidth: 1,
    defaultColor: '#000',
  };

  public clearFeild(ctx: CanvasRenderingContext2D | null, width: number, height: number): void {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
	};

  public drawElemet({ ctx, elem, fill = false, isHovered }: IDrawElement): void {
    if (ctx === null) {
      return;
    }

    // draw shape shadow on hover
		if (fill) {
			ctx.fillStyle = elem.color || this.fillStyle;
			ctx.closePath();

			if (isHovered) {
				ctx.shadowColor = this.shadow.color;
				ctx.shadowBlur = this.shadow.blur;
				ctx.shadowOffsetX = this.shadow.offsetX;
				ctx.shadowOffsetY = this.shadow.offsetY;
			} else {
        ctx.shadowBlur = 0;
			}
			ctx.fill();

		} else {
			ctx.strokeStyle = this.border.defaultColor;
			ctx.lineWidth = this.border.defaultWidth;
			ctx.stroke();
		}


    // draw shape border
    if (elem.border) {
      ctx.strokeStyle = elem.border.color || this.border.defaultColor;
			ctx.lineWidth = elem.border.width || this.border.defaultWidth;
			ctx.stroke();
    }

    // draw text inside shape
    if (elem.text && elem.text.value) {
      const { value, fontWeight, fontSize, fontFamily, fontStyle, color, align } = elem.text;
      const { defaultColor, defaultFontFamily, defaultFontSize, defaultFontStyle, defaultFontWeight } = this.text;

      const font = (fontStyle || defaultFontStyle) + ' ' + (fontWeight || defaultFontWeight) + ' ' + (fontSize || defaultFontSize) + ' ' + (fontFamily || defaultFontFamily);
      ctx.font = font
      ctx.fillStyle = color || defaultColor;
      ctx.textBaseline = 'middle';

      let textX = elem.x + (elem.width / 2);
      let textY = elem.y + (elem.height / 2);

      if (!align || align === 'center') {
        ctx.textAlign = 'center';
      }

      if (align === 'left') {
        textX = elem.x;
      }

      if (align === 'right') {
        textX = elem.x + elem.width;
        ctx.textAlign = 'right';
      }

      ctx.fillText(value, textX, textY, elem.width);
    }
	};

  public drawHandles({ ctx, elem }: IDrawHandle): void {
    if (ctx === null) {
      return;
    }
		for (const handleType of Object.values(EMouseHandle)) {
			const handle = this.getHandlePosition(handleType, elem);
			ctx.fillStyle = this.handleFillStyle;
			ctx.globalCompositeOperation = 'xor';
			ctx.beginPath();
			ctx.arc(handle.x, handle.y, HANDLE_SIZE, 0, 2 * Math.PI);
			ctx.fill();
			ctx.globalCompositeOperation = 'source-over';
		}
	};

  private getHandlePosition(currentHandle: EMouseHandle, elem: ILayoutElement): IPoint {
    const posHandle: IPoint = { x: 0, y: 0 };
    switch (currentHandle) {
      case EMouseHandle.topLeft:
        posHandle.x = elem.x;
        posHandle.y = elem.y;
        break;
      case EMouseHandle.topRight:
        posHandle.x = elem.x + elem.width;
        posHandle.y = elem.y;
        break;
      case EMouseHandle.bottomLeft:
        posHandle.x = elem.x;
        posHandle.y = elem.y + elem.height;
        break;
      case EMouseHandle.bottomRight:
        posHandle.x = elem.x + elem.width;
        posHandle.y = elem.y + elem.height;
        break;
      case EMouseHandle.top:
        posHandle.x = elem.x + elem.width / 2;
        posHandle.y = elem.y;
        break;
      case EMouseHandle.left:
        posHandle.x = elem.x;
        posHandle.y = elem.y + elem.height / 2;
        break;
      case EMouseHandle.bottom:
        posHandle.x = elem.x + elem.width / 2;
        posHandle.y = elem.y + elem.height;
        break;
      case EMouseHandle.right:
        posHandle.x = elem.x + elem.width;
        posHandle.y = elem.y + elem.height / 2;
        break;
      }
    return posHandle;
  };

}
