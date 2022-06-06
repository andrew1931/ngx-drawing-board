import { Component } from '@angular/core';
import { IGridConfig, Shape } from '../../src/lib/types';


@Component({
  selector: 'ngx-drawing-board-demo',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  public canvas = {
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    backgroundImage: ''
  }

  public gridConfig: IGridConfig = {
    enabled: true,
    cellSize: 12,
    strokeWidth: .5,
    strokeColor: '#000',
  };
  public gridSizeMouseStep: boolean = false;
  public activeShape: Shape = 'rectangle';
  public fitCanvasToImage: boolean = false;


  selectShape(shape: Shape): void {
    this.activeShape = shape;
  };

  toggleGrid(): void {
    this.gridConfig = { ...this.gridConfig, enabled: !this.gridConfig.enabled };
  };

  setGridColor(e: any): void {
    this.gridConfig = { ...this.gridConfig, strokeColor: e.target.value };
  };

  setGridLineWidth(e: any): void {
    this.gridConfig = { ...this.gridConfig, strokeWidth: +e.target.value };
  };

  setGridCellSize(e: any): void {
    this.gridConfig = { ...this.gridConfig, cellSize: +e.target.value };
  };

  toggleGridSizeMouseStep(): void {
    this.gridSizeMouseStep = !this.gridSizeMouseStep;
  };

  setSize(val: { target: 'width' | 'height', input: any }): void {
    this.canvas[val.target] = +val.input.value;
  };

  setBackgroundColor(e: any): void {
    this.canvas.backgroundColor = e.target.value;
  };

  setBackgroundImage(e: any): void {
    if (e.target.files) {
      const file = e.target.files[0];
      const oFReader = new FileReader();
      if (file) {
        oFReader.readAsDataURL(file);
        oFReader.onload = ((res: any) => {
          this.canvas.backgroundImage = res.target?.result || '';
        });
      }
    }
  };

  removeBackgroundImage(): void {
    this.canvas.backgroundImage = '';
  };

  toggleFitCanvasToImage(): void {
    this.fitCanvasToImage = !this.fitCanvasToImage;
  };

}
