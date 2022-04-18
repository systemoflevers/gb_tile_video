import { TwoBitDrawing } from "./twobitdrawing.js";
import { TwoBitColourPicker } from "./twobitcolourpicker.js";
import { TwoBitCanvas } from "./twobitcanvas.js";
import { TextTile } from "./texttile.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    //width: 20vw;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #drawing-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #canvases {
    width: 100%;
    display: flex;
    justify-content: space-evenly;
  }
  #canvases > * {
    width: 30%;
  }
  two-bit-drawing {
    width: 100%
  }
  two-bit-canvas {
    width: 100%;
    display: block;
  }
  two-bit-colour-picker {
    margin-top: 3%;
    width: 100%;
  }
</style>

<div id="container">
<div id="canvases">
  <two-bit-canvas id="low-bit-canvas" width="8" height="8"></two-bit-canvas>
  <div id="drawing-container">
    <two-bit-drawing id="drawing" colour-picker-id="colour-picker" width="8" height="8"></two-bit-drawing>
    <two-bit-colour-picker id="colour-picker"></two-bit-colour-picker>
  </div>
  <two-bit-canvas id="high-bit-canvas" width="8" height="8"></two-bit-canvas>
</div>
<span>
  <input id="show-grid" type="checkbox" /><label for="show-grid">show grid</label>
</span>
<text-tile></text-tile>
</div>
`;

class TileDemo extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    
    this.drawing = this.shadowRoot.getElementById('drawing');
    this.highBitCanvas = this.shadowRoot.getElementById('high-bit-canvas');
    this.highBitCanvas.colours[1] = this.highBitCanvas.colours[0];
    this.highBitCanvas.colours[2] = this.highBitCanvas.colours[3];
    this.lowBitCanvas = this.shadowRoot.getElementById('low-bit-canvas');
    this.lowBitCanvas.colours[1] = this.lowBitCanvas.colours[3];
    this.lowBitCanvas.colours[2] = this.lowBitCanvas.colours[0];
  }

  connectedCallback() {
    const showGridCheckbox = this.shadowRoot.getElementById('show-grid');
    showGridCheckbox.addEventListener('change', (ev) => {
      if (showGridCheckbox.checked) {
        this.drawing.setAttribute('show-pixel-grid', '');
      } else {
        this.drawing.removeAttribute('show-pixel-grid');
      }
      console.log(showGridCheckbox.checked);
    });

    this.drawing.addEventListener('needRedraw', (ev) => {
      this.renderTextEncoding();
      const twoBitData = this.drawing.twoBitCanvas.twoBitData;
      this.lowBitCanvas.setTwoBitData(twoBitData);
      this.highBitCanvas.setTwoBitData(twoBitData);
    });
    this.renderTextEncoding();
  }

  renderTextEncoding() {
    this.shadowRoot.querySelector('text-tile').setTwoBitData(
      this.drawing.twoBitCanvas.twoBitData);
  }
}

customElements.define('tile-demo', TileDemo);