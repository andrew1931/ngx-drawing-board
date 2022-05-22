import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxDrawingBoard } from './ngx-drawing-board';
import { Rectangle, Ellips } from './shapes';


@NgModule({
  declarations: [ NgxDrawingBoard ],
  exports: [ NgxDrawingBoard ],
  imports: [ CommonModule ],
  providers: [ Rectangle, Ellips ]
})
export class NgxDrawingBoardModule {}
