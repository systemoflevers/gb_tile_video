import { TwoBitDrawing } from "../twobitdrawing.js";
import { TwoBitColourPicker } from "../twobitcolourpicker.js";
import { TwoBitCanvas } from "../twobitcanvas.js";
import { TextTile } from "../texttile.js";

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
  #low-bit-container, #high-bit-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

<div id="container">
  <div id="canvases">
    <div id="low-bit-container">
      <span>Low bit drawing</span>
      <two-bit-canvas id="low-bit-canvas" width="8" height="8"></two-bit-canvas>
    </div>
    <div id="drawing-container">
      <span>Draw Here</span>
      <two-bit-drawing id="drawing" colour-picker-id="colour-picker" width="8" height="8"></two-bit-drawing>
      <two-bit-colour-picker id="colour-picker"></two-bit-colour-picker>
    </div>
    <div id="high-bit-container">
      <span>High bit drawing</span>
      <two-bit-canvas id="high-bit-canvas" width="8" height="8"></two-bit-canvas>
    </div>
  </div>
  <span>
    <input id="show-grid" type="checkbox" /><label for="show-grid">show grid</label>
  </span>
  <text-tile></text-tile>
  <span id="text-mode-inputs">
  <input id="text-mode-z-to-t" type="radio" name="text-mode" value="ZeroToThree" /><label for="text-mode-z-to-t">0-3 pixels</label>
  <input id="text-mode-2bpp-bin" type="radio" name="text-mode" value="2BPPBin" /><label for="text-mode-2bpp-bin">GB 2BPP binary</label>
  <input id="text-mode-2bpp-dec" type="radio" name="text-mode" value="2BPPDec" /><label for="text-mode-2bpp-dec">GB 2BPP decimal</label>
  <input id="text-mode-2bpp-hex" type="radio" name="text-mode" value="2BPPHex" /><label for="text-mode-2bpp-hex">GB 2BPP hex</label>
  </span>
</div>
`;

const kColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

class EncodingDemo extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.drawing = this.shadowRoot.getElementById('drawing');
    this.highBitCanvas = this.shadowRoot.getElementById('high-bit-canvas');
    this.highBitCanvas.colours[1] = this.highBitCanvas.colours[0];
    this.highBitCanvas.colours[2] = this.highBitCanvas.colours[3];
    this.lowBitCanvas = this.shadowRoot.getElementById('low-bit-canvas');
    this.lowBitCanvas.colours[1] = this.lowBitCanvas.colours[3];
    this.lowBitCanvas.colours[2] = this.lowBitCanvas.colours[0];
    this.textTile = this.shadowRoot.querySelector('text-tile');
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

    this.shadowRoot.getElementById('text-mode-inputs').addEventListener('change',
      (ev) => {
        this.textTile.mode = ev.target.value;
        this.textTile.redraw();
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
    this.textTile.setTwoBitData(
      this.drawing.twoBitCanvas.twoBitData);
  }
}

customElements.define('encoding-demo', EncodingDemo);