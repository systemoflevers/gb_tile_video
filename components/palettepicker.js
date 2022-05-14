import { paletteChangeEvent } from "../modules/colours.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
#container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  justify-items: center;
}
div > div {
  aspect-ratio: 1;
  width: 100%;
}
#h0 {
  grid-column: 2;
}
</style>
<div id="container">
  <div id="h0" style="grid-column: 1; grid-row:2"></div>
  <div id="h1" style="grid-column: 1; grid-row:3"></div>
  <div id="h2" style="grid-column: 1; grid-row:4"></div>
  <div id="h3" style="grid-column: 1; grid-row:5"></div>
  ${colourChoice(0)}
  ${colourChoice(1)}
  ${colourChoice(2)}
  ${colourChoice(3)}
</div>
`;

function colourInput(colourIndex, choice) {
  let checked = '';
  if (colourIndex === choice) checked = 'checked';
  const style = `grid-column: ${colourIndex + 2}; grid-row: ${choice + 2};`;
  return `<input type="radio" id="c${colourIndex}v${choice}" name="c${colourIndex}" value="${choice}" style="${style}" ${checked} />`;
}

function colourChoice(colourIndex) {
  const colourInputs = [];
  for (let i = 0; i < 4; ++i) {
    colourInputs.push(colourInput(colourIndex, i));
  }
  const style = `grid-column: ${colourIndex + 2}; grid-row: 1;`;
  return `<span style="${style}">${colourIndex}</span>${colourInputs.join('')}`;
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
      this.paletteChange();
    });
  }

  expandPalette() {
    const colours = [];
    for (let i = 0; i < 4; ++i) {
      colours.push(this.colours[this.palette[i]]);
    }
    return colours;
  }

  paletteChange() {
    this.dispatchEvent(paletteChangeEvent(this.expandPalette()));
  }

  setPalette(palette) {
    for (let i = 0; i < 4; ++i) {
      this.palette[i] = palette[i];
      const inputs =
        this.shadowRoot.querySelectorAll(`input[type=radio][name=c${i}]`);
      for (const input of inputs) {
        if (parseInt(input.value) !== palette[i]) continue;
        input.checked = true;
      }
    }
    this.paletteChange();
  }
}
customElements.define('palette-picker', PalettePicker);