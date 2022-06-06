import { Component, EventEmitter, Output, Input } from '@angular/core';
import { IGridConfig, Shape } from '../../../src/lib/types';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.css'],
})
export class Toolbar {

  public shapeButtons: { icon: string, value: Shape }[] = [
    { icon: 'square', value: 'rectangle' },
    { icon: 'triangle', value: 'triangle' },
    { icon: 'circle', value: 'ellipse' }
  ];

  @Input() canvas: {
    width: number,
    height: number,
    backgroundColor: string
    backgroundImage: string
  } | undefined;
  @Input() activeShape: Shape | undefined;
  @Input() gridConfig: IGridConfig | undefined;
  @Input() gridSizeMouseStep: boolean | undefined;
  @Input() fitCanvasToImage: boolean | undefined;

  @Output() selectShape = new EventEmitter<Shape>()
  @Output() toggleGrid = new EventEmitter<void>()
  @Output() setGridColor = new EventEmitter<any>()
  @Output() setGridCellSize = new EventEmitter<any>()
  @Output() setGridLineWidth = new EventEmitter<any>()
  @Output() toggleGridSizeMouseStep = new EventEmitter<void>()
  @Output() setSize = new EventEmitter<{ target: 'width' | 'height', input: any }>()
  @Output() setBackgroundColor = new EventEmitter<any>()
  @Output() setBackgroundImage = new EventEmitter<any>()
  @Output() removeBackgroundImage = new EventEmitter<void>()
  @Output() toggleFitCanvasToImage = new EventEmitter<void>()



}
