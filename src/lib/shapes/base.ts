import { EMouseHandle, IDrawElement, IDrawHandle } from '../types';
import { getHandlePosition, isImage } from '../utils';

export const HANDLE_SIZE = 5;

export class BaseShape {

  protected handleFillStyle = '#00B100';

  protected shadow = {
    color: '#ccc',
    blur: 10,
    offsetX: 0,
    offsetY: 0
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

  public clearField(ctx: CanvasRenderingContext2D | null, width: number, height: number): void {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
	};

  public drawElement({ ctx, elem, fill = false, isHovered }: IDrawElement): void {
    if (ctx === null) {
      return;
    }

    // draw shape shadow on hover
		if (fill) {
      ctx.fillStyle = elem.color;
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
    if (elem.border && elem.border.color) {
      ctx.strokeStyle = elem.border.color;
      ctx.lineWidth = elem.border.width || this.border.defaultWidth;
      if (isImage(elem)) {
        const { x, y, width, height } = elem;
        ctx.strokeRect(x, y, width, height);
      } else {
        ctx.stroke();
      }
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
        ctx.textAlign = 'left';
      }

      if (align === 'right') {
        textX = elem.x + elem.width;
        ctx.textAlign = 'right';
      }
      ctx.shadowColor = 'rgba(0,0,0,0)';

      ctx.fillText(value, textX, textY);
    }
	};

  public drawHandles({ ctx, elem }: IDrawHandle): void {
    if (ctx === null) {
      return;
    }
		for (const handleType of Object.values(EMouseHandle)) {
			const handle = getHandlePosition(handleType, elem);
      if (handle) {
        ctx.fillStyle = this.handleFillStyle;
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, HANDLE_SIZE, 0, 2 * Math.PI);
        ctx.fill();
      }
		}
	};

}
