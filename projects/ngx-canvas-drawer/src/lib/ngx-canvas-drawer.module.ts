import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxCanvasDrawer } from './ngx-canvas-drawer';
import { Rectangle, Elips } from './shapes';


@NgModule({
  declarations: [ NgxCanvasDrawer ],
  exports: [ NgxCanvasDrawer ],
  imports: [ CommonModule ],
  providers: [ Rectangle, Elips ]
})
export class NgxCanvasDrawerModule {}
