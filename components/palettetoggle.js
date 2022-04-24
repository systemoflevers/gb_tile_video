import { paletteChangeEvent } from "../modules/colours.js";
import { AnimationController } from "../modules/animation_controller.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<input type="checkbox" id="enable-checkbox" /><label for="enable-checkbox">enable</label>
<input type="range" id="toggle-slider" list="palette-options" min="0" max="1" step="1" value="0" disabled />
<datalist id="palette-options">
  <option value="0"></option>
  <option value="1"></option>
</datalist>
<input type="checkbox" id="animate-checkbox" disabled /><label for="animate-checkbox">animate</label>
`;

const kColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

export class PaletteToggle extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.colours = kColours;
    this.offColour = 0;
    this.onColour = 3;
    this.plane = 0;

    this.slider = this.shadowRoot.getElementById('toggle-slider');
    this.animationController = new AnimationController(5, this.animate.bind(this));
  }

  connectedCallback() {
    this.slider.addEventListener('input', (ev) => {
        this.plane = parseInt(ev.target.value);
        this.paletteChange();
      });
    const animateCheckbox = this.shadowRoot.getElementById('animate-checkbox');
    animateCheckbox.addEventListener('change', (ev) => {
      if (animateCheckbox.checked) {
        this.animationController.start();
      } else {
        this.animationController.stop();
      }
    });
    const enableCheckbox = this.shadowRoot.getElementById('enable-checkbox');
    enableCheckbox.addEventListener('change', () => {
      const enabled = enableCheckbox.checked;
      this.slider.disabled = !enabled
      animateCheckbox.checked &&= enabled;
      animateCheckbox.disabled = !enabled;
      if (enabled) {
        this.paletteChange();
      } else {
        this.fireChange(this.colours);
        this.animationController.stop();
      }
    });
  }

  animate() {
    this.plane = (this.plane + 1) % 2;
    this.slider.value = this.plane;
    this.paletteChange();
  }

  paletteChange() {
    const colours = [];
    for (let i = 0; i < 4; ++i) {
      colours.push(this.pickColour(i));
    }
    this.fireChange(colours);
  }

  pickColour(paletteIndex) {
    const colourIndex = !!(paletteIndex & (this.plane + 1)) ? this.onColour : this.offColour;
    return this.colours[colourIndex];
  }

  fireChange(colours) {
    this.dispatchEvent(paletteChangeEvent(colours));
  }
}
customElements.define('palette-toggle', PaletteToggle);