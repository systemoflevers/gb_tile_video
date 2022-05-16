import { TwoBitDrawing } from "../twobitdrawing.js";
import { ColourAndPalettePicker } from "../colourandpalettepicker.js";
import { kPaletteChangeEventType } from "../../modules/colours.js";
import { ShowGrid } from "../showgrid.js";
import {TextGridTile} from "./textgridtile.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
/*@media (orientation: landscape) {
  #container {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }
  :host {
    aspect-ratio: 2;
  }
}
@media (orientation: portrait) {
  #container {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 1 /2;
    max-height: 100%;
  }
  :host {
    aspect-ratio: 1 / 2;
  }
}*/
:host {
  --picker-flow-direction: row;
}

#container {
  display: grid;
  //flex-direction: var(--picker-flow-direction, row);
  gap: 10px;
  align-items: center;
  justify-items: center;
  grid-auto-flow: var(--picker-flow-direction, row);
}
#drawing-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
colour-and-palette-picker {
  width: 75%;
}
#tile-container {
  width: 100%;
  height: 100%;
  position: relative;
}
two-bit-drawing {
  width: 100%;
  height: 100%;
}
text-grid-tile { 
  z-index: 2;
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: difference;
  color: white;
}
text-grid-tile[hidden] {
  display: none;
}
</style>
<div id="container">
<div id="drawing-container">
  <div id="tile-container">
    <text-grid-tile hidden></text-grid-tile>
    <two-bit-drawing width="8" height="8" colour-picker-id="pickers"></two-bit-drawing>
  </div>
  <div id="control-container">
    <show-grid pixel></show-grid>
    <span><input type="checkbox" id="numbers-checkbox" /><label for="numbers-checkbox">Show Pixel Values</label></span>
  </div>
</div>
<colour-and-palette-picker id="pickers"></colour-and-palette-picker>
</div>
`;
export class TileAndPalette extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.drawing = this.shadowRoot.querySelector('two-bit-drawing');
    this.pickers = this.shadowRoot.getElementById('pickers');
    this.pickers.addEventListener(kPaletteChangeEventType, (ev) => {
      this.drawing.setPalette(ev.detail);
    });
    this.pickers.colourPicker.pickColour(3);
    this.showGrid = this.shadowRoot.querySelector('show-grid');
    this.showGrid.drawing = this.drawing;
    this.showNumbers = this.shadowRoot.getElementById('numbers-checkbox');
    this.numbers = this.shadowRoot.querySelector('text-grid-tile');
    this.showNumbers.addEventListener('change', this.showOrHideNumbers.bind(this));
    this.drawing.addEventListener('needRedraw', () => {
      this.numbers.setPixelData(this.drawing.twoBitCanvas.twoBitData);
    });
  }

  showOrHideNumbers() {
    this.numbers.hidden = !this.showNumbers.checked;
  }
}
customElements.define('tile-and-palette', TileAndPalette);