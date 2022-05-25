import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDrawingBoard } from './ngx-drawing-board';
import { Rectangle, Ellipse, Triangle } from './shapes';


@NgModule({
  declarations: [ NgxDrawingBoard ],
  exports: [ NgxDrawingBoard ],
  imports: [ CommonModule ],
  providers: [ Rectangle, Ellipse, Triangle ]
})
export class NgxDrawingBoardModule {}
