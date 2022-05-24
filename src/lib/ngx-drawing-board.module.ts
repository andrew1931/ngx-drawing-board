import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDrawingBoard } from './ngx-drawing-board';
import { Rectangle, Ellips, Triangle } from './shapes';


@NgModule({
  declarations: [ NgxDrawingBoard ],
  exports: [ NgxDrawingBoard ],
  imports: [ CommonModule ],
  providers: [ Rectangle, Ellips, Triangle ]
})
export class NgxDrawingBoardModule {}
