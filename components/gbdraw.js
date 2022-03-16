import { TwoBitDrawing } from './twobitdrawing.js';
import { TwoBitColourPicker } from './twobitcolourpicker.js';
import { arrayBufferToBase64, base64ToUint8Array, TileMap } from '../modules/data_conversion.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
two-bit-drawing {
  --height-ratio: calc(56.65 / 100);
  --width-ratio: calc(74.6 / 100);
  padding: calc(6.525% / var(--width-ratio)) calc(13.625% / var(--width-ratio));
  width: calc(47.35% / var(--width-ratio));
  background-color: grey;
  --small-radius-base: 2.54%;
  --big-radius-base: 10.56%;
  border-top-left-radius: calc(var(--small-radius-base) / var(--width-ratio)) calc(var(--small-radius-base) / var(--height-ratio));
  border-bottom-left-radius: calc(var(--small-radius-base) / var(--width-ratio)) calc(var(--small-radius-base) / var(--height-ratio));
  border-top-right-radius: calc(var(--small-radius-base) / var(--width-ratio)) calc(var(--small-radius-base) / var(--height-ratio));
  border-bottom-right-radius: calc(var(--big-radius-base) / var(--width-ratio)) calc(var(--big-radius-base) / var(--height-ratio));
}
#container {
  position: relative;
}

two-bit-colour-picker {
  /* TODO: See if this can/should be computed similarly to two-bit-drawing sizes
           above. */
  position: absolute;
  width: 24%;
  left: 18%;
  bottom: 1%;
}
</style>
<div id='container'>
  <two-bit-drawing id="drawing" colour-picker-id="colour-picker" width="160" height="144"></two-bit-drawing>
  <two-bit-colour-picker id="colour-picker"></two-bit-colour-picker>
</div>
`

export class GBDraw extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this.drawing = shadow.querySelector('two-bit-drawing');
  }

  connectedCallback() {
    this.drawing.tileMap = TileMap.makeFullMap(20, 18);
  }
}
customElements.define('gb-draw', GBDraw);