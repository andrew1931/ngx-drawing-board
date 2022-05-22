# ngx-canvas-drawboard

Contents
========
- [Getting started](#getting-started)
- [Usage](#usage)
- [API](#api)
- [Interfaces](#interfaces)
- [License](#license)

## Getting started
### Step 1: Install `ngx-canvas-drawboard`:

```bash
npm install ng2-canvas-drawboard --save
```

### Step 2: Import NgxCanvasDrawboardModule:
```js
import { NgxCanvasDrawboardModule } from 'ngx-canvas-drawboard';

@NgModule({
  ...
  imports: [..., NgxCanvasDrawboardModule],
  ...
})
export class SomeModule {}
```

## Usage
Define options in your consuming component:
```html
<ngx-canvas-drawboard
    [elements]="[]"
    [shape]="rectangle"
    [width]="1024"
    [height]="724"
  >
  </ngx-canvas-drawboard>
```

## API
### Inputs
| Input  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| elements | ILayoutElement | undefined | yes | List where all drawn elements are stored |
| width | number | 600 | no | width of canvas |
| height | number | 600 | no | height of canvas |
| shape | 'rectangle' \| 'elips' | 'rectangle' | no | current drawing shape |
| backgroundImage | string | '' | no | canvas background image |
| backgroundColor | string | '#f2f2f2' | no | canvas background color |
| fitCanvasToImage | boolean | true | no | makes canvas the same size as provided background image |

### Outputs
| Output  | Description |
| ------------- | ------------- |
| (onAddElement)  | Fires when new element has been drawn on canvas |
| (onFocusElement)  | Fires when element has been clicked |
| (onBlurElement)  | Fires when selected element looses focus |
| (onMouseEnterElement)  | Fires when mouse enteres element |
| (onMouseLeaveElement)  | Fires when mouse leaves element |
| (onResizeEnd)  | Fires when element's resizing is over |
| (onDragEnd)  | Fires when element's draging is over |


## Interfaces
```ts
  interface ILayoutElement {
      x: number;
      y: number;
      width: number;
      height: number;
      shape: 'rectangle' | 'elips';
      color?: string // default is '#ffffff';
    }
```

## License

The MIT License (see the [LICENSE](https://github.com/andrew1931/ngx-canvas-drawboard/blob/main/LICENSE) file for the full
text)
