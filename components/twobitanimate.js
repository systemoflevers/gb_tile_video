import { TwoBitDrawing } from "./twobitdrawing.js";
import { frameData } from "../modules/out_data.js";
import { FadeControl } from "./fadecontrol.js";
import { ShowGrid } from "./showgrid.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
div {
  width: 50%;
}
</style>
<div>
  <two-bit-drawing width="160" height="144"></two-bit-drawing>
</div>
<button id="play-button">play</button>
<button id="pause-button" hidden>pause</button>

<show-grid></show-grid>
<fade-control></fade-control>

`

export class TwoBitAnimate extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.drawing = shadow.querySelector('two-bit-drawing');
    this.frameData = frameData;
    this.startFrameTime = 0;
    this.startFrame = 0;
    this.lastFrame = 0;
    this.play = false;
  }

  connectedCallback() {
    const playButton = this.shadowRoot.getElementById('play-button');
    const pauseButton = this.shadowRoot.getElementById('pause-button');

    playButton.addEventListener('click', () => {
      this.play = true;
      requestAnimationFrame(this.resumeFrames.bind(this));
      playButton.hidden = true;
      pauseButton.hidden = false;
    });
    pauseButton.addEventListener('click', () => {
      this.play = false;
      playButton.hidden = false;
      pauseButton.hidden = true;
    });

    const showGrid = this.shadowRoot.querySelector('show-grid'); 
    showGrid.drawing = this.drawing;
    showGrid.pixelGrid = false;
    showGrid.tileGrid = true;
    this.shadowRoot.querySelector('fade-control').fadeCallback = (colours) => {
      this.drawing.twoBitCanvas.colours = colours;
      this.drawing.twoBitCanvas.redrawCanvas();
    }
  }

  firstFrame(timestamp) {
    this.startFrameTime = timestamp;
    this.startFrame = 0;
    this.restOfFrames(timestamp);
  }

  resumeFrames(timestamp) {
    this.startFrameTime = timestamp;
    this.startFrame = this.lastFrame;
    this.restOfFrames(timestamp);
  }

  restOfFrames(timestamp) {
    if (!this.play) return;
    const timeSinceStart = timestamp - this.startFrameTime;
    let frame = Math.floor(timeSinceStart*(60/1000)) + this.startFrame;
    if (frame >= this.frameData.length) {
      frame = 0;
      this.startFrame = 0;
      this.startFrameTime = timestamp;
    }
    this.drawing.twoBitCanvas.setTwoBitDataFromB64(this.frameData[frame]);
    this.lastFrame = frame;
    requestAnimationFrame(this.restOfFrames.bind(this));
  }

  doAnimate() {
    requestAnimationFrame(this.firstFrame.bind(this));
  }
}
customElements.define('two-bit-animate', TwoBitAnimate);