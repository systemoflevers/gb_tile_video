import { TwoBitColourPicker } from "./twobitcolourpicker.js";
import { PalettePicker } from "./palettepicker.js";
import { kPaletteChangeEventType } from "../modules/colours.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
#colour-picker-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}
two-bit-colour-picker {
  grid-column: 2 / 6;
}
</style>
<div id="container">
  <div id="colour-picker-container">
    <two-bit-colour-picker></two-bit-colour-picker>
  </div>
  <palette-picker></palette-picker>
</div>
</div>
`;
export class ColourAndPalettePicker extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.colourPicker = this.shadowRoot.querySelector('two-bit-colour-picker');
    this.palettePicker = this.shadowRoot.querySelector('palette-picker');
    this.palettePicker.addEventListener(kPaletteChangeEventType, (ev) => {
      this.colourPicker.setPalette(ev.detail);
    });
  }
}
customElements.define('colour-and-palette-picker', ColourAndPalettePicker);