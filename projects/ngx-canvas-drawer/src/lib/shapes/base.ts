import { EMouseHandle, IDrawElement, IDrawHandle, ILayoutElement, IPoint } from '../types';

export const HANDLE_SIZE = 5;

export class BaseShape {

  protected fillStyle = '#FAF7F8';
  protected strokeStyle = '#000';
  protected handleFillStyle = '#000';
  protected shadow = {
    color: '#ccc',
    blur: 10,
    offsetX: 0,
    offsetY: 0
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
			ctx.strokeStyle = this.strokeStyle;
			ctx.lineWidth = 1;
			ctx.stroke();
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
