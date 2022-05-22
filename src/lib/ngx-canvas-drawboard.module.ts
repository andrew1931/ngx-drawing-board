import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxCanvasDrawboard } from './ngx-canvas-drawboard';
import { Rectangle, Ellips } from './shapes';


@NgModule({
  declarations: [ NgxCanvasDrawboard ],
  exports: [ NgxCanvasDrawboard ],
  imports: [ CommonModule ],
  providers: [ Rectangle, Ellips ]
})
export class NgxCanvasDrawboardModule {}
