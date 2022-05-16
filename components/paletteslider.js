import { paletteChangeEvent } from "../modules/colours.js";
import { AnimationController } from "../modules/animation_controller.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<!--input type="checkbox" id="enable-checkbox" /><label for="enable-checkbox">enable</label-->
<input type="range" id="palette-slider" list="palette-options" min="0" max="3" step="1" value="0" />
<datalist id="palette-options">
  <option value="0"></option>
  <option value="1"></option>
  <option value="2"></option>
  <option value="3"></option>
</datalist>
<input type="checkbox" id="animate-checkbox" /><label for="animate-checkbox">animate</label>
`;

function defaultPalette() {
  return [0, 1, 2, 3];
}

function makeDefaultPalettes(n) {
  const palettes = [];
  for (let i = 0; i < n; ++i) {
    palettes.push(defaultPalette());
  } 
  return palettes;
}

export class PaletteSlider extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.slider = this.shadowRoot.getElementById('palette-slider');
    this.options = this.shadowRoot.getElementById('palette-options');
    this.optionCount = 4;
    this.selectedPalette = 0;
    this.palettes = makeDefaultPalettes(this.optionCount);
  }

  connectedCallback() {
    this.slider.addEventListener('input', (ev) => {
      this.selectedPalette = parseInt(ev.target.value);
      this.paletteChange();
    });
    this.animateCheckbox = this.shadowRoot.getElementById('animate-checkbox');
    this.animateCheckbox.addEventListener('change', (ev) => {
      if (this.animateCheckbox.checked) {
        if (!this.animationController) {
          this.animationController =
            new AnimationController(this.frameRate, this.animate.bind(this));
        }
        this.animationController.start();
      } else {
        this.animationController.stop();
      }
    });
    this.setFrameRate(10);
    /*const enableCheckbox = this.shadowRoot.getElementById('enable-checkbox');
    enableCheckbox.addEventListener('change', () => {
      const enabled = enableCheckbox.checked;
      this.slider.disabled = !enabled
      animateCheckbox.checked &&= enabled;
      animateCheckbox.disabled = !enabled;
      if (enabled) {
        this.paletteChange();
      } else {
        this.fireChange(this.colours);
        this.animationController?.stop();
      }
    });*/
  }

  setNumberOfPalettes(n) {
    const options = [];
    for (let i = 0; i < n; ++i) {
      const option = document.createElement('option');
      option.value = i;
      options.push(option);
    }
    if (n > this.optionCount) {
      const newPalettes = makeDefaultPalettes(n - this.optionCount);
      this.palettes = this.palettes.concat(newPalettes);
    } else {
      this.palettes.slice(0, n);
    }
    this.optionCount = n;
    this.options.replaceChildren(...options);
    this.slider.max = n - 1;
    this.selectedPalette = Math.min(n - 1, this.selectedPalette);
    this.slider.value = this.selectedPalette;
  }

  animate() {
    this.selectedPalette = (this.selectedPalette + 1) % this.optionCount;
    this.slider.value = this.selectedPalette;
    this.paletteChange();
  }

  paletteChange() {
    if (this.changeCallback) {
      const selectedPalette = this.palettes[this.selectedPalette];
      this.changeCallback(selectedPalette);
    }
  }

  setFrameRate(fps) {
    this.frameRate = fps;
    this.animationController?.stop();
    this.animationController = new AnimationController(this.frameRate, this.animate.bind(this));
    if (this.animateCheckbox.checked) {
      this.animationController.start();
    }
  }

  setCurrentPalette(palette) {
    this.palettes[this.selectedPalette] = palette.slice();
  }
}
customElements.define('palette-slider', PaletteSlider);