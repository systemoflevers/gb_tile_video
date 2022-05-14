import { TwoBitDrawing } from "../twobitdrawing.js";

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
    position: absolute;
    transition: opacity 1s, transform 10s;
  }

  #moving-drawing {
    transform: translateY(-70%);
    transition: transform 5s linear;
    visibility: hidden;
  }
  #moving-drawing.down {
    transform: translateY(0);
    visibility: visible;
  }

  #off-screen {
    background-color: rgb(240 248 208); /*#dbffa4;*/ /*#f0ffd8*/
    transition: opacity 2s, transform 10s;
    height: 100%;
    aspect-ratio: 160 / 144;
    z-index: 2;
    mix-blend-mode: color;
  }
  #off-screen.invis {
    opacity: 0;
  }
</style>
<div id="container">
  <div id="off-screen"></div>
  <two-bit-drawing id="static-drawing" width="160" height="144"></two-bit-drawing>
</div>
`;

const kOffScreenLines = `{
  "map":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "tiles":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAAAAAAAAAA="
  }`;

export class OffScreen extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.drawing = shadow.querySelector('two-bit-drawing');
  }

  async turnOff() {
    this.drawing.fromB64JSONGBData(kOffScreenLines);
    await new Promise((res) => setTimeout(res, 1500));
    this.drawing.style.opacity = 0;
    this.drawing.style.transform = 'scaleX(0.7)';
  }
}
customElements.define('off-screen', OffScreen);