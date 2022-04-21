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
<span id="text-mode-inputs">
<input id="text-mode-z-to-t" type="radio" name="text-mode" value="ZeroToThree" /><label for="text-mode-z-to-t">0-3 pixels</label>
<input id="text-mode-2bpp-bin" type="radio" name="text-mode" value="2BPPBin" /><label for="text-mode-2bpp-bin">GB 2BPP binary</label>
<input id="text-mode-2bpp-dec" type="radio" name="text-mode" value="2BPPDec" /><label for="text-mode-2bpp-dec">GB 2BPP decimal</label>
<input id="text-mode-2bpp-hex" type="radio" name="text-mode" value="2BPPHex" /><label for="text-mode-2bpp-hex">GB 2BPP hex</label>
<div>
<span id="fade-type-picker">
  <input id="fade0" type="radio" name="fade-type" value="0" checked /><label for="fade0">fade type 1</label>
  <input id="fade1" type="radio" name="fade-type" value="1" /><label for="fade1">fade type 2</label>
</span>
<input id="fade-slider" type="range" list="fade-options" min="0" max="6" step="1" />
<datalist id="fade-options">
<option value="0" label="b"></option>
<option value="1" ></option>
<option value="2" ></option>
<option value="3" label="n"></option>
<option value="4" ></option>
<option value="5" ></option>
<option value="6" label="w"></option>
</datalist>
</div>
</div>
`;

const kFadePalettes = [
  [
    [3, 3, 3, 3],
    [2, 2, 2, 3],
    [1, 1, 2, 3],
    [0, 1, 2, 3],
    [0, 1, 2, 2],
    [0, 1, 1, 1],
    [0, 0, 0, 0],
  ],
  [
    [3, 3, 3, 3],
    [2, 3, 3, 3],
    [1, 2, 3, 3],
    [0, 1, 2, 3],
    [0, 0, 1, 2],
    [0, 0, 0, 1],
    [0, 0, 0, 0],
  ],
];

const kColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

class TileDemo extends HTMLElement {
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
    this.fadeSlider = this.shadowRoot.getElementById('fade-slider');
    this.fadeTypePicker = this.shadowRoot.getElementById('fade-type-picker');
    this.fadeType = 0;
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

    this.fadeTypePicker.addEventListener('change', (ev) => {
      this.fadeType = parseInt(ev.target.value);
      this.updateFade();
    })

    this.fadeSlider.addEventListener('input', (ev) => {
      this.updateFade();
    })
  }

  updateFade() {
    const fadeLevel = parseInt(this.fadeSlider.value);
    const fadePalette = kFadePalettes[this.fadeType][fadeLevel];
    const fadeColours = [];
    for (const colour of fadePalette) {
      fadeColours.push(kColours[colour]);
    }
    this.drawing.twoBitCanvas.colours = fadeColours;
    this.drawing.twoBitCanvas.redrawCanvas();
    this.shadowRoot.getElementById('colour-picker').setPalette(fadeColours);
  }

  renderTextEncoding() {
    this.textTile.setTwoBitData(
      this.drawing.twoBitCanvas.twoBitData);
  }
}

customElements.define('tile-demo', TileDemo);