import { paletteChangeEvent } from "../modules/colours.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<span id="fade-type-picker">
  <input id="fade0" type="radio" name="fade-type" value="0" checked /><label for="fade0">fade type 1</label>
  <input id="fade1" type="radio" name="fade-type" value="1" /><label for="fade1">fade type 2</label>
</span>
<input id="fade-slider" type="range" list="fade-options" min="0" max="6" step="1" />
<datalist id="fade-options">
  <option value="0" label="b"></option>
  <!--option value="1" ></option>
  <option value="2" ></option-->
  <option value="3" label="n"></option>
  <!--option value="4" ></option>
  <option value="5" ></option-->
  <option value="6" label="w"></option>
</datalist>
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

function getFadeColours(fadeLevel, fadePalettes, baseColours) {
  const fadePalette = fadePalettes[fadeLevel];
  const fadeColours = [];
  for (const colour of fadePalette) {
    fadeColours.push(kColours[colour]);
  }
  return fadeColours;
}

export class FadeControl extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.fadeCallback = null;
    this.colours = kColours;
    this.fadeType = 0;
    this.fadeLevel = 3;
  }

  connectedCallback() {
    this.shadowRoot.getElementById('fade-type-picker').
      addEventListener('change', (ev) => {
        this.fadeType = parseInt(ev.target.value);
        this.updateFade();
      });
    this.shadowRoot.getElementById('fade-slider').addEventListener('input',
      (ev) => {
        this.fadeLevel = parseInt(ev.target.value);
        this.updateFade();
      });
  }

  updateFade() {
    const colours = getFadeColours(
      this.fadeLevel, kFadePalettes[this.fadeType], this.colours);
    this.dispatchEvent(paletteChangeEvent(colours));
  }
}
customElements.define('fade-control', FadeControl);