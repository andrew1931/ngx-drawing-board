import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDrawingBoard } from './ngx-drawing-board';
import { Rectangle, Ellipse, Triangle, Image } from './shapes';


@NgModule({
  declarations: [ NgxDrawingBoard ],
  exports: [ NgxDrawingBoard ],
  imports: [ CommonModule ],
  providers: [
    Rectangle,
    Ellipse,
    Triangle,
    Image
  ]
})
export class NgxDrawingBoardModule {}
