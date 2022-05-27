import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDrawingBoard } from './ngx-drawing-board';
import { RectangleShape, EllipseShape, TriangleShape, ImageShape } from './shapes';
import { Renderer } from './renderer';


@NgModule({
  declarations: [ NgxDrawingBoard ],
  exports: [ NgxDrawingBoard ],
  imports: [ CommonModule ],
  providers: [
    Renderer,
    RectangleShape,
    EllipseShape,
    TriangleShape,
    ImageShape
  ]
})
export class NgxDrawingBoardModule {}
