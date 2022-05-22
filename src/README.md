<h1 align="center">ngx-drawing-board</h1>

<p align="center">
  <br>
  <i>The ngx-drawing-board is a canvas area where you can draw, resize and drag shapes with a mouse.</i>
  <br>
</p>

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
| elements | ILayoutElement | undefined | yes | List where all drawn elements are stored |
| width | number | 600 | no | width of canvas |
| height | number | 600 | no | height of canvas |
| shape | 'rectangle' \| 'ellips' | 'rectangle' | no | current drawing shape |
| backgroundImage | string | '' | no | canvas background image |
| backgroundColor | string | '#f2f2f2' | no | canvas background color |
| fitCanvasToImage | boolean | true | no | makes canvas the same size as provided background image |

### Outputs
| Output  | Arguments | Description |
| ------------- | ------------- | -------------
| (onAddElement) | ILayoutElement | Fires when new element has been drawn on canvas |
| (onFocusElement) | number (element index) |Fires when element has been clicked |
| (onBlurElement) | number (element index) | Fires when selected element looses focus |
| (onMouseEnterElement) | number (element index) | Fires when mouse enteres element |
| (onMouseLeaveElement) | number (element index) | Fires when mouse leaves element |
| (onResizeEnd) | void | Fires when element's resizing is over |
| (onDragEnd) | void | Fires when element's draging is over |


## Interfaces
```ts
  interface ILayoutElement {
    x: number,
    y: number,
    width: number,
    height: number,
    shape: 'rectangle' | 'ellips',
    color?: string,
    text?: ILayoutElementText,
    border?: ILayoutElementBorder,
  };


  interface ILayoutElementText {
    value: string,
    color?: string,
    fontWeight?: 100 | 200 | 300 | 400 | 500 | 600,
    fontFamily?: string,
    fontStyle?: string,
    fontSize?: string,
    align?: 'left' | 'center' | 'right',
  };

  interface ILayoutElementBorder {
    color?: string,
    width?: number,
  };
```

## License

The MIT License (see the [LICENSE](https://github.com/andrew1931/ngx-drawing-board/blob/main/LICENSE) file for the full
text)
