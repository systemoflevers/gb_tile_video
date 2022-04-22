import { FadeControl } from "./fadecontrol.js";
import { ShowGrid } from "./showgrid.js";
import { TwoBitDrawing } from "./twobitdrawing.js";
import { TwoBitColourPicker } from "./twobitcolourpicker.js";
import { TwoBitCanvas } from "./twobitcanvas.js";
import { TextTile } from "./texttile.js";
import { PalettePicker } from "./palettepicker.js";
import { PaletteSlider } from "./paletteslider.js";
import { PaletteToggle } from "./palettetoggle.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #drawing-container {
    width: 30%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  two-bit-drawing {
    width: 100%
  }
  two-bit-colour-picker {
    margin-top: 3%;
    width: 100%;
  }
</style>
<div id="container">
  <div id="drawing-container">
    <two-bit-drawing id="drawing" colour-picker-id="colour-picker" width="8" height="8"></two-bit-drawing>
    <two-bit-colour-picker id="colour-picker"></two-bit-colour-picker>
  </div>
  <show-grid></show-grid>
  <span id="palette-controls">
  <fade-control></fade-control>
    <palette-picker></palette-picker>
    <palette-slider></palette-slider>
    <palette-toggle></palette-toggle>
  </span>
</div>
`;

class TileFadeDemo extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.drawing = shadow.getElementById('drawing');
  }

  connectedCallback() {
    const colourPicker = this.shadowRoot.getElementById('colour-picker');
    this.shadowRoot.querySelector('show-grid').drawing = this.drawing;
    const paletteSetter = (colours) => {
      this.drawing.twoBitCanvas.colours = colours;
      this.drawing.twoBitCanvas.redrawCanvas();
      colourPicker.setPalette(colours);
    };
    //this.shadowRoot.querySelector('fade-control').fadeCallback = paletteSetter;
    /*this.shadowRoot.querySelector('palette-picker')
      .addEventListener('palette-change', (ev) => {
        paletteSetter(ev.detail);
      });
    this.shadowRoot.querySelector('palette-slider')
      .addEventListener('palette-change', (ev) => {
        paletteSetter(ev.detail);
      });*/
    this.shadowRoot.getElementById('palette-controls')
      .addEventListener('palette-change', (ev) => {
        paletteSetter(ev.detail);
      });
  }
}

customElements.define('tile-fade-demo', TileFadeDemo);