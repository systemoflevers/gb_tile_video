import { TwoBitDrawing } from "../twobitdrawing.js";
import { PalettePicker } from "../palettepicker.js";
import { AnimationController, PresetAnimation } from "../../modules/animation_controller.js";
import { kGreenColours, expandPalette } from "../../modules/colours.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow-y: clip;
  }

  two-bit-drawing {
    height: 100%;
    aspect-ratio: 160 / 144;
    position:absolute;
  }
</style>
<div id="container">
  <two-bit-drawing " width="160" height="144"></two-bit-drawing>
</div>
`;

const kTilesIntroScreen = `{
  "map": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAECAwQABQYHBggAAAAAAAAAAAAAAAkKCwwNDg8QEQAAAAAAABITEhMSExITAAAUFRQVFBUUFQAAFhcWFxYXFhcAABgZGBkYGRgZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhscGx0AGh4fICEiIyQAAAAAAAAlJicoKSorLC0uLzAxMgAAAAAAAAAAADM0MzQzNDM0AAAAAAAAAAAAAAAANTY3ODk6OzwAAAAAAAAAAAAAAAA9Pj0+PT49PgAAAAAAAAAAAAAAAAAAP0BBQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAENERUZHSElISkhKS0xNTk8AAAAAUFFSU1RVVlVXVVdYWVpbXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF1eXV4AAF1eXV4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "tiles": "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"
}
`;

export class IntroScreen extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.drawing = this.shadowRoot.querySelector('two-bit-drawing');
  }

  setPalette(palette) {
    this.drawing.twoBitCanvas.colours = expandPalette(palette, kGreenColours);
    this.drawing.twoBitCanvas.redrawCanvas();
  }

  fadeFromBlack() {
    return new PresetAnimation(5, [
      () => this.setPalette([3, 3, 3, 3]),
      () => this.setPalette([2, 3, 3, 3]),
      () => this.setPalette([1, 2, 3, 3]),
      () => this.setPalette([0, 1, 2, 3]),
    ]).start();
  }

  fadeToWhite() {
    return new PresetAnimation(5, [
      () => this.setPalette([0, 1, 2, 3]),
      () => this.setPalette([0, 0, 1, 2]),
      () => this.setPalette([0, 0, 0, 1]),
      () => this.setPalette([0, 0, 0, 0]),
    ]).start();
  }

  async show() {
    this.setPalette([3, 3, 3, 3]);
    this.drawing.fromB64JSONGBData(kTilesIntroScreen);
    await this.fadeFromBlack();
    await new Promise((res) => setTimeout(res, 5000));
    await this.fadeToWhite();
  }
}
customElements.define('intro-screen', IntroScreen);