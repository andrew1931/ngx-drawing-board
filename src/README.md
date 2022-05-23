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
    [elements]="[]"
    [shape]="'ellips'"
    [width]="1024"
    [height]="724"
  >
  </ngx-drawing-board>
```

## API
### Inputs
| Input  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| elements | IElement | undefined | yes | List where all drawn elements are stored |
| width | number | 600 | no | width of canvas |
| height | number | 600 | no | height of canvas |
| shape | 'rectangle' \| 'ellips' | 'rectangle' | no | current drawing shape |
| backgroundImage | string | '' | no | canvas background image |
| backgroundColor | string | '#f2f2f2' | no | canvas background color |
| fitCanvasToImage | boolean | true | no | makes canvas the same size as provided background image |

### Outputs
| Output  | Arguments | Description |
| ------------- | ------------- | -------------
| (onAddElement) | IElement | Fires when new element has been drawn on canvas |
| (onClickElement) | {index: number, clickCoords: { x: number, y: number }} |Fires when element has been clicked |
| (onFocusElement) | number (element index) |Fires when element gets focus |
| (onBlurElement) | number (element index) | Fires when selected element looses focus |
| (onMouseEnterElement) | number (element index) | Fires when mouse enteres element |
| (onMouseLeaveElement) | number (element index) | Fires when mouse leaves element |
| (onResizeStart) | void | Fires when element's resizing has started |
| (onResizing) | void | Fires when element is being resized |
| (onResizeEnd) | void | Fires when element's resizing is over |
| (onDragStart) | void | Fires when element's draging has started |
| (onDraging) | void | Fires when element is being draged |
| (onDragEnd) | void | Fires when element's draging is over |

## Interfaces
```ts
  interface IElement {
    x: number,
    y: number,
    width: number,
    height: number,
    shape: 'rectangle' | 'ellips',
    color?: string,
    text?: IElementText,
    border?: IElementBorder,
  };
  
  interface IElementText {
    value: string,
    color?: string,
    fontWeight?: 100 | 200 | 300 | 400 | 500 | 600,
    fontFamily?: string,
    fontStyle?: string,
    fontSize?: string,
    align?: 'left' | 'center' | 'right',
  };

  interface IElementBorder {
    color?: string,
    width?: number,
  };
```

## License

The MIT License (see the [LICENSE](https://github.com/andrew1931/ngx-drawing-board/blob/main/LICENSE) file for the full
text)
