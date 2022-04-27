import { FadeControl } from "../fadecontrol.js";
import { ShowGrid } from "../showgrid.js";
import { TwoBitDrawing } from "../twobitdrawing.js";
import { TwoBitColourPicker } from "../twobitcolourpicker.js";
import { TwoBitCanvas } from "../twobitcanvas.js";
import { TextTile } from "../texttile.js";
import { PalettePicker } from "../palettepicker.js";
import { PaletteSlider } from "../paletteslider.js";
import { PaletteToggle } from "../palettetoggle.js";
import { BigPaletteAnimation } from "../bigpaletteanimation.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: grid;
    align-items: center;
    height: 100%;
    grid-template-columns: 1fr 1fr 1fr;
  }
  #drawing-container {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  two-bit-drawing {
    width: 100%
  }
  two-bit-colour-picker {
    grid-column: 2 / 6;
    margin-top: 3%;
    width: 100%;
  }
  #palette-controls {
    grid-column: 1;
    grid-row: 1;
    justify-self: end;
    margin-right: 6%;
    font-weight: bold;
    width: 65%;
    font-size: 2em;
  }
  #colour-control {
    grid-column: 3;
    grid-row: 1;
    margin-left: 3%;
    width: 120%;
  }
  #cpicker-container {
    width: 65%;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    margin-bottom: 5%;
  }
  #colour-blocker {
    width: 34%;
    height: 100%;
    position: absolute;
    background-color: gray;
    opacity: 100%;
  }
  #colour-blocker.move {
    animation: 1s colour-blocker-move;
    animation-fill-mode: forwards;
  }
  #colour-blocker.away {
    animation: 1s colour-blocker-away;
    animation-fill-mode: forwards;
  }
  @keyframes colour-blocker-move {
    from {
      top: 20%;
    }
    to {
      top: 35%;
    }
  }

  @keyframes colour-blocker-away {
    from {
      top: 35%;
    }
    to {
      top: 100%;
    }
  }
</style>
<div id="container">
  <div id="drawing-container">
    <two-bit-drawing id="drawing" colour-picker-id="colour-picker" width="8" height="8"></two-bit-drawing>
    <show-grid hidden ></show-grid>
  </div>
  <div id="colour-control">
    <div id="colour-blocker"></div>
    <div id="cpicker-container">
      <two-bit-colour-picker  id="colour-picker" style="opacity: 0;"></two-bit-colour-picker>
    </div>
    <div id="palette-controls" style="opacity: 0;">
      <palette-picker></palette-picker>
    </div>
  </div>
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

  showGrid() {
    this.drawing.setAttribute('show-pixel-grid', '');
  }

  showColours() {
    this.shadowRoot.querySelector('two-bit-colour-picker').style.opacity = '100%';
    this.shadowRoot.getElementById('colour-blocker').className = 'move';
  }

  showPalette() {
    this.shadowRoot.getElementById('palette-controls').style.opacity = '100%';
    this.shadowRoot.getElementById('colour-blocker').className = 'away';
  }
}

customElements.define('tile-palette-pick', TileFadeDemo);