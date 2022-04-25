import { TwoBitDrawing } from "./twobitdrawing.js";
import { frameData } from "../modules/out_data.js";
import { frameData as fd2 } from "../modules/out_data2.js";
import { base64ToUint8Array } from '../modules/data_conversion.js';
import { TileSet } from "../modules/tile_collections.js";
import { FadeControl } from "./fadecontrol.js";
import { ShowGrid } from "./showgrid.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
div {
  width: 50%;
}
#split-canvases {
  --gap-val: 0px;
  width: calc(30% + (19 * var(--gap-val)));
  gap: var(--gap-val);
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  transition: gap 1s, width 1s;
  margin: auto;
}
</style>
<!--div >
  <two-bit-drawing width="160" height="144"></two-bit-drawing>
</div-->
<button id="play-button">play</button>
<button id="pause-button" hidden>pause</button>

<show-grid></show-grid>
<fade-control></fade-control>
<button id="explode-button">explode</button>
<div id="split-canvases">
${makeCanvases()}
</div>

`

function makeCanvases() {
  const canvases = [];
  for (let i = 0; i < 20 * 18; ++i) {
    canvases.push('<two-bit-drawing width="8" height="8"></two-bit-drawing>');
  }
  return canvases.join('\n');
}
export class TwoBitAnimate extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.drawing = shadow.querySelector('two-bit-drawing');
    this.frameData = frameData;
    this.fd2 = [];
    for (const frame of fd2) {
      this.fd2.push(base64ToUint8Array(frame));
    }
    this.startFrameTime = 0;
    this.startFrame = 0;
    this.lastFrame = 0;
    this.play = false;
    this.canvasesContainer = shadow.getElementById('split-canvases');
    this.canvases = shadow.querySelectorAll('#split-canvases > two-bit-drawing');
    this.tileSet = new TileSet(20 * 18);

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
    this.shadowRoot.querySelector('fade-control')
      .addEventListener('palette-change', (ev) => {
        this.drawing.twoBitCanvas.colours = ev.detail;
        this.drawing.twoBitCanvas.redrawCanvas();
      });
    
    this.shadowRoot.getElementById('explode-button')
      .addEventListener('click',(ev) => {
        if (this.canvasesContainer.style.getPropertyValue('--gap-val') === '10px') {
          this.canvasesContainer.style.setProperty('--gap-val', '0px');
        } else {
          this.canvasesContainer.style.setProperty('--gap-val', '10px');
        }
      });
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
    let frame = Math.floor(timeSinceStart * (60 / 1000)) + this.startFrame;
    if (frame >= this.frameData.length) {
      frame = 0;
      this.startFrame = 0;
      this.startFrameTime = timestamp;
    }
    //this.drawing.twoBitCanvas.setTwoBitDataFromB64(this.frameData[frame]);
    /*this.drawing.tileMap.tileSet.fromGBTileData(this.fd2[frame]);
    this.drawing.needRedraw = true;*/
    
    this.lastFrame = frame;

    this.tileSet.fromGBTileData(this.fd2[frame]);
    for (let i = 0; i < 360; ++i) {
      this.canvases[i].setTwoBitData(this.tileSet.tiles[i]);
    }

    requestAnimationFrame(this.restOfFrames.bind(this));
  }

  doAnimate() {
    requestAnimationFrame(this.firstFrame.bind(this));
  }
}
customElements.define('two-bit-animate', TwoBitAnimate);