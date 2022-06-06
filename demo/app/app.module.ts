import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxDrawingBoardModule } from '../../src/lib/ngx-drawing-board.module';
import { Toolbar } from './toolbar/toolbar';

@NgModule({
  declarations: [
    AppComponent,
    Toolbar
  ],
  imports: [
    BrowserModule,
    NgxDrawingBoardModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
