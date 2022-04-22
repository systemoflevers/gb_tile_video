import { paletteChangeEvent } from "../modules/colours.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
#container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
}
div > div {
  height: 2em;
}
#h0 {
  grid-column: 2;
}
</style>
<div id="container">
  <div id="h0"></div>
  <div id="h1"></div>
  <div id="h2"></div>
  <div id="h3"></div>
  ${colourChoice(0)}
  ${colourChoice(1)}
  ${colourChoice(2)}
  ${colourChoice(3)}
</div>
`;

function colourInput(colourIndex, choice) {
  let checked = '';
  if (colourIndex === choice) checked = 'checked';
  return `<input type="radio" name="c${colourIndex}" value="${choice}" ${checked} />`;
}

function colourChoice(colourIndex) {
  const colourInputs = [];
  for (let i = 0; i < 4; ++i) {
    colourInputs.push(colourInput(colourIndex, i));
  }
  return `<span>colour ${colourIndex}</span>${colourInputs.join('')}`;
}

const kColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

export class PalettePicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.setColours(kColours);
    this.palette = [0, 1, 2, 3];
  }

  setColours(colours) {
    this.colours = colours;
    for (let i = 0; i < 4; ++i) {
      const header = this.shadowRoot.getElementById(`h${i}`);
      header.style.backgroundColor = `rgb(${colours[i].join(', ')})`;
    }
  }

  connectedCallback() {
    const container = this.shadowRoot.getElementById('container');
    container.addEventListener('change', (ev) => {
      const paletteIndex = parseInt(ev.target.name[1]);
      const choice = parseInt(ev.target.value);
      this.palette[paletteIndex] = choice;
      this.dispatchEvent(paletteChangeEvent(this.expandPalette()));
    });
  }

  expandPalette() {
    const colours = [];
    for (let i = 0; i < 4; ++i) {
      colours.push(this.colours[this.palette[i]]);
    }
    return colours;
  }
}
customElements.define('palette-picker', PalettePicker);