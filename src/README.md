# [Ngx-drawing-board](https://github.com/andrew1931/ngx-drawing-board/blob/main/src)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/andrew1931/ngx-drawing-board/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/ngx-drawing-board?color=brightgreen&label=npm%20package)](https://www.npmjs.com/package/ngx-drawing-board) 


Angular library to draw, resize and drag shapes with a mouse on canvas

Contents
========
- [Getting started](#getting-started)
- [Usage](#usage)
- [API](#api)
- [Interfaces](#interfaces)
- [License](#license)

## Getting started
### Step 1: Install `ngx-drawing-board`:

```bash
npm install ngx-drawing-board --save
```

### Step 2: Import NgxDrawingBoardModule:
```ts
import { NgxDrawingBoardModule } from 'ngx-drawing-board';

@NgModule({
  ...
  imports: [..., NgxDrawingBoardModule],
  ...
})
export class SomeModule {}
```

## Usage
```html
  <ngx-drawing-board
    [data]="[]"
    [shape]="'ellipse'"
    [width]="1024"
    [height]="724"
  >
  </ngx-drawing-board>
```

## API
### Inputs
| Input               | Type        | Default           | Required | Description                                             |
|---------------------|-------------|-------------------|----------|---------------------------------------------------------|
| data                | IElement    | []                | no       | List where all drawn elements are stored                |
| width               | number      | 600               | no       | Width of canvas                                         |
| height              | number      | 600               | no       | Height of canvas                                        |
| shape               | Shape       | "rectangle"       | no       | Current drawing shape                                   |
| backgroundImage     | string      | ""                | no       | Canvas background image                                 |
| backgroundColor     | string      | "#ffffff"         | no       | Canvas background color                                 |
| initialElementColor | string      | "transparent"     | no       | Drawing element initial color                           |
| gridConfig          | IGridConfig | { enabled: true } | no       | Settings for canvas background grid                     |
| fitCanvasToImage    | boolean     | true              | no       | Makes canvas the same size as provided background image |

### Outputs
| Output                | Arguments         | Description                                     |
|-----------------------|-------------------|-------------------------------------------------|
| (onAddElement)        | IOutputEvent      | Fires when new element has been drawn on canvas |
| (onClickElement)      | IOutputClickEvent | Fires when element has been clicked             |
| (onFocusElement)      | IOutputEvent      | Fires when element gets focus                   |
| (onBlurElement)       | IOutputEvent      | Fires when selected element looses focus        |
| (onMouseEnterElement) | IOutputEvent      | Fires when mouse enteres element                |
| (onMouseLeaveElement) | IOutputEvent      | Fires when mouse leaves element                 |
| (onResizeStart)       | IOutputEvent      | Fires when element's resizing has started       |
| (onResizing)          | IOutputEvent      | Fires when element is being resized             |
| (onResizeEnd)         | IOutputEvent      | Fires when element's resizing is over           |
| (onDragStart)         | IOutputEvent      | Fires when element's dragging has started       |
| (onDragging)          | IOutputEvent      | Fires when element is being draged              |
| (onDragEnd)           | IOutputEvent      | Fires when element's dragging is over           |

## Types
```ts
  interface IElement {
    x: number,
    y: number,
    width: number,
    height: number,
    shape: Shape,
    color: string,
    text?: IElementText,
    border?: IElementBorder,
    imageSrc?: CanvasImageSource,
  }
  
  interface IElementText {
    value: string,
    color?: string,
    fontWeight?: 100 | 200 | 300 | 400 | 500 | 600,
    fontFamily?: string,
    fontStyle?: string,
    fontSize?: string,
    align?: 'left' | 'center' | 'right',
  }

  interface IElementBorder {
    color?: string,
    width?: number,
  }

  interface IGridConfig {
    enabled?: boolean,
    cellSize?: number,
    strokeWidth?: number,
    strokeColor?: string,
  }

  interface IOutputEvent {
    index: number,
    element: IElement
  }

  interface IOutputClickEvent {
    index: number,
    element: IElement
    clickCoords: IPoint
  }

  type Shape = 'rectangle' | 'ellipse' | 'triangle' | 'image';


```

## License

The MIT License (see the [LICENSE](https://github.com/andrew1931/ngx-drawing-board/blob/main/LICENSE) file for the full
text)
