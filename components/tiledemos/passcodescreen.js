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

const kTilesPasscodeScreen = `{
  "map": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAgMEBQYFBwAAAAAAAAAAAAAAAAgICQoLDA0OAAAAAAAAAAAAAAAADxAREhMUFRYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADFwAAAAAAAAAAAAAAAAAAAAAAABgZGhscHR4fAAAAAAAAAAAAAAAAICEgIgAjJCUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJicoKSorLC0uLzAxAAAAAAAAAAAAAAAAMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "tiles": "/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A8ADwAMAAwAD/AP8A/wD/AA8ADwADAAMA/wD/AP8A/wDAAMAAAAAAAP8A/wD/AP8APAA8AAwADAD/AP8A/wD/AAAAAAAAAAAA/wD/AP8A/wD8APwAMAAwAP8A/wD/AP8AwwDDAMMAwwDDAMMAwwDDAMMAwwDDAMMADwAPAA8ADwAPAA8ADwAPAAwADAAMAAwADAAMAAwADAA8ADwAAAAAAAAAAAA/AD8AMAAwADAAMAD8APwA/wD/AP8A/wADAAMAAAAAAPAA8ADDAMMAwwDDAMMAwwD/AP8AwADAAPAA8AD/AP8A/wD/AAMAAwAPAA8A/wD/AP8A/wAAAAAAwADAAP8A/wD/AP8ADAAMADwAPAD/AP8A/wD/AD8APwA/AD8A/wD/AP8A/wDwAPAA8ADwAP8A/wD/AP8AAAAAAAMAAwD/AP8A/wD/AMMAwwDDAMMA/wD/AP8A/wD/AP8A/wD/AA8ADwAPAA8ADwAPAAAAAADAAMAA/wD/AP8A/wA8ADwADAAMAAwADAAAAAAAAAAAADwAPAA8ADwA/AD8ADAAMAAwADAAMAAwAA8ADwADAAMAwwDDAP8A/wDAAMAAAAAAAAwADAAPAA8A8ADwADAAMAAwADAA8ADwAPAA8ADwAPAA8ADwAAAAAAAAAAAAAAAAAP8A/wD/AP8ADAAMAD8APwD/AP8A/wD/ADAAMADwAPAA/wD/AP8A/wAPAA8ADwAPAP8A/wD/AP8A/AD8AP8A/wDwAPAA8ADwAAAAAADwAPAAAAAAAAMAAwD/AP8ABwACADIAMgAyADMA/wD/AAwABABnAGcABwAPADwAPwAMAAwAPAA8ADwAPAD/AP8AyQCAAIAAlACUAJwA/wD/AIMAgQCZAIEAgwCfAD8APwA4ADMAMAAzADAAmAD/AP8AcgAgACAA5QAlAGcA/wD/AHAAJgAgACcAIAAwAP8A/wDBAEAATADMAEwAzADnAOcAgQCBAOcA5wDnAOcA/wD/AIcAMwACAD4AAgCHAOQA5ADkAAQABABnAAQABACfAJ8A/wD/AP8A/wD/AP8A"
}
`;

export class PasscodeScreen extends HTMLElement {
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

  fadeToBlack() {
    return new PresetAnimation(5, [
      () => this.setPalette([0, 1, 2, 3]),
      () => this.setPalette([1, 2, 3, 3]),
      () => this.setPalette([2, 3, 3, 3]),
      () => this.setPalette([3, 3, 3, 3]),
    ]).start();
  }

  async show() {
    this.setPalette([3, 3, 3, 3]);
    this.drawing.fromB64JSONGBData(kTilesPasscodeScreen);
    await this.fadeFromBlack();
    await new Promise((res) => setTimeout(res, 3000));
    await this.fadeToBlack();
  }
}
customElements.define('passcode-screen', PasscodeScreen);