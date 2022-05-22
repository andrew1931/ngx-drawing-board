import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxCanvasDrawboard } from './ngx-canvas-drawboard';
import { Rectangle, Elips } from './shapes';


@NgModule({
  declarations: [ NgxCanvasDrawboard ],
  exports: [ NgxCanvasDrawboard ],
  imports: [ CommonModule ],
  providers: [ Rectangle, Elips ]
})
export class NgxCanvasDrawboardModule {}
