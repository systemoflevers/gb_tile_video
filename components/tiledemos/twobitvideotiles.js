import { TwoBitDrawing } from "../twobitdrawing.js";
import { frameData } from "../../modules/out_data2.js";
import { base64ToUint8Array } from '../../modules/data_conversion.js';
import { TileSet } from "../../modules/tile_collections.js";
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
#container {
  display: flex;
  height: 100%;
}
two-bit-drawing {
  margin: -1px;
}
#split-canvases {
  --gap-val: 0px;
  /*width: calc(30% + (19 * var(--gap-val)));*/
  gap: var(--gap-val);
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  transition: gap 1s, width 1s, height 1s;
  margin: auto;
  aspect-ratio: 160 / 144;
  height: 100%;
  background-color: grey;
}
.bigexploded {
  animation: 0.5s explode-grid;
  animation-fill-mode: forwards;
}
#split-canvases.smalled {
  animation: 1s unexplode-small;
  animation-fill-mode: forwards;
}

@keyframes explode-grid {
  from {
    gap: 0
  }
  to {
    gap: 10px;
  }
}

@keyframes unexplode-small {
  from {
    height: 100%;
    width: auto;
    gap: 10px;
  }
  to {
    height: 50%;
    gap: 0px;
    transform: translateX(-110%);
  }
}
/*.smalled > two-bit-drawing:not(:nth-child(73)) {
  animation: 1s unexplode-small-tiles;
  animation-fill-mode: forwards;
}*/
@keyframes unexplode-small-tiles {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-88%*20));
  }
}

.tileplace {
  animation: 1s tile-stay;
  animation-fill-mode: forwards;
  z-index: 2;
  box-shadow: 3px 4px 3px 0px black;
}
@keyframes tile-stay {
  from {
    transform: translateX(0);
  }
  to {
    /*transform: translateX(calc(110%*20));*/
    transform: translateX(calc(88%*20)) translateY(536%);
    box-shadow: 0px 0px black;
  }
}
</style>
<div id="container">
  <span id="button-container" hidden>
    <button id="play-button">play</button>
    <button id="pause-button" hidden>pause</button>
    <button id="explode-button">explode</button>
  </span>
  <div id="split-canvases">
  ${makeCanvases()}
  </div>
</div>

`

function makeCanvases() {
  const canvases = [];
  for (let i = 0; i < 20 * 18; ++i) {
    canvases.push('<two-bit-drawing width="8" height="8"></two-bit-drawing>');
  }
  return canvases.join('\n');
}
export class TwoBitVideoTiles extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.drawing = shadow.querySelector('two-bit-drawing');
    this.frameData = [];
    for (const frame of frameData) {
      this.frameData.push(base64ToUint8Array(frame));
    }
    this.startFrameTime = 0;
    this.startFrame = 0;
    this.lastFrame = 0;
    this.playing = false;
    this.canvasesContainer = shadow.getElementById('split-canvases');
    this.canvases = shadow.querySelectorAll('#split-canvases > two-bit-drawing');
    this.tileSet = new TileSet(20 * 18);

  }

  connectedCallback() {
    const playButton = this.shadowRoot.getElementById('play-button');
    const pauseButton = this.shadowRoot.getElementById('pause-button');

    playButton.addEventListener('click', () => {
      this.play()
    });
    pauseButton.addEventListener('click', () => {
      this.pause();
    });
    
    this.shadowRoot.getElementById('explode-button')
      .addEventListener('click',(ev) => {
        if (this.canvasesContainer.style.getPropertyValue('--gap-val') === '10px') {
          this.deExplode();
        } else {
          this.explode();
        }
      });
  }

  play() {
    const playButton = this.shadowRoot.getElementById('play-button');
    const pauseButton = this.shadowRoot.getElementById('pause-button');
    this.playing = true;
    requestAnimationFrame(this.resumeFrames.bind(this));
    playButton.hidden = true;
    pauseButton.hidden = false;
  }

  pause() {
    const playButton = this.shadowRoot.getElementById('play-button');
    const pauseButton = this.shadowRoot.getElementById('pause-button');
    this.playing = false;
    playButton.hidden = false;
    pauseButton.hidden = true;
  }

  explode() {
    this.canvasesContainer.className = 'bigexploded';
    //this.canvasesContainer.style.gap = '10px';
    //this.canvasesContainer.style.setProperty('--gap-val', '10px');
  }

  deExplode() {
    /*this.canvasesContainer.style.height = 'auto';
    this.canvasesContainer.style.width = '40%';*/
    //this.canvasesContainer.style.gap = '0px';
    //this.canvasesContainer.classList.add('smalled');
    //this.canvasesContainer.style.setProperty('--gap-val', '0px');
    this.canvasesContainer.className = 'smalled';
  }

  moveTile() {
    //73
    this.canvasesContainer.querySelector('two-bit-drawing:nth-child(159)').className = 'tileplace';
  }

  hideTile() {
    this.canvasesContainer.querySelector('two-bit-drawing:nth-child(159)').style.opacity = '0%';
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
    if (!this.playing) return;
    const timeSinceStart = timestamp - this.startFrameTime;
    let frame = Math.floor(timeSinceStart * (60 / 1000)) + this.startFrame;
    if (frame >= this.frameData.length) {
      frame = 0;
      this.startFrame = 0;
      this.startFrameTime = timestamp;
    }
    
    this.lastFrame = frame;

    this.tileSet.fromGBTileData(this.frameData[frame]);
    for (let i = 0; i < 360; ++i) {
      this.canvases[i].setTwoBitData(this.tileSet.tiles[i]);
    }

    requestAnimationFrame(this.restOfFrames.bind(this));
  }

  doAnimate() {
    requestAnimationFrame(this.firstFrame.bind(this));
  }
}
customElements.define('two-bit-video-tiles', TwoBitVideoTiles);