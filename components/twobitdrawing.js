import { TwoBitCanvas } from './twobitcanvas.js';
import { arrayBufferToBase64, base64ToUint8Array, arrayBufferToHexString } from '../modules/data_conversion.js';
import {TileMap}  from '../modules/tile_collections.js';
const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: block;
  //position: relative;
}
#container {
    position: relative;
}
two-bit-canvas {
    cursor: crosshair;
    width: 100%;
    touch-action: pinch-zoom;
}
#tool-picker {
    position: absolute;
    left: 100%;
    top: 12%;
}
two-bit-colour-picker {
    position: absolute;
    width: 37%;
}
svg {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
<div id="container">
<two-bit-canvas></two-bit-canvas>
<div id="grid-container">
<svg width="100%" height="100%">
  <defs>
    <pattern id="v-grid-lines" x="0" y="0" width="5%" height="100%" patternUnits="userSpaceOnUse">
      <line x1="5%" y1="0%" x2="5%" y2="100%" stroke="black" stroke-width="1"/>
    </pattern>
    <pattern id="h-grid-lines" x="0" y="0" width="100%" height="5%" patternUnits="userSpaceOnUse">
    <line x1="0%" y1="5%" x2="100%" y2="5%" stroke="black" stroke-width="1"/>
  </pattern>
  </defs>
  <rect fill="url(#v-grid-lines)" width="99%" height="100%"/>
  <rect fill="url(#h-grid-lines)" width="100%" height="99%"/>
</svg>
</div>
</div>
`;

function getGridSVG(widthDivisions, heightDivisions) {
  const widthRatio = 100 / widthDivisions;
  const heightRatio = 100 / heightDivisions;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.innerHTML = `
  <defs>
    <pattern id="v-grid-lines" x="0" y="0" width="${widthRatio}%" height="100%" patternUnits="userSpaceOnUse">
      <line x1="${widthRatio}%" y1="0%" x2="${widthRatio}%" y2="100%" stroke="black" stroke-width="1"></line>
    </pattern>
    <pattern id="h-grid-lines" x="0" y="0" width="100%" height="${heightRatio}%" patternUnits="userSpaceOnUse">
    <line x1="0%" y1="${heightRatio}%" x2="100%" y2="${heightRatio}%" stroke="black" stroke-width="1"></line>
  </pattern>
  </defs>
  <rect fill="url(#v-grid-lines)" width="99%" height="100%"></rect>
  <rect fill="url(#h-grid-lines)" width="100%" height="99%"></rect>`;
  return svg;
}


function convertCoordinate(point, origin, boundingLength, pixelLength) {
  const v = Math.floor(((point - origin) / boundingLength) * pixelLength);
  return v;
}

const PENCIL = 0;
const TILE_SELECT = 1;
const TILE_PLACE = 2;

class TwoBitDrawing extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this.twoBitCanvas = shadow.querySelector('two-bit-canvas');
    this.isPointerDown = false;
    this.colour = 3;

    // An AbortController used to remove the colour-change when the
    // colour-picker-id changes or this is removed from a document.  
    this.colourChangeHandlerController = null;

    this.lastPoint = null;
    this.needRedraw = false;
    this.changedTiles = new Set();

    this.tool = PENCIL;

    this.selectedTile = 0;
    this.nextTile = 1;
  }

  static get observedAttributes() { return ['width', 'height', 'colour-picker-id', 'show-pixel-grid', 'show-tile-grid']; }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'colour-picker-id') {
      if (newValue === null) {
        this.removeColourChangeListener();
        return;
      }
      this.removeAndAddColourChangeListener()
    }
    console.log('change', name, oldValue, newValue, this[name]);
    this.updateDimensions();
  }

  get height() {
    return parseInt(this.getAttribute('height')) || 0;
  }
  set height(value) {
    console.log('height setter');
    this.setAttribute('height', value);
  }

  get width() {
    return parseInt(this.getAttribute('width')) || 0;
  }
  set width(value) {
    this.setAttribute('width', value);
  }

  get colourPickerID() {
    return this.getAttribute('colour-picker-id');
  }
  set colourPickerID(value) {
    return this.setAttribute('colour-picker-id', value);
  }

  get showPixelGrid() {
    return this.hasAttribute('show-pixel-grid');
  }
  get showTileGrid() {
    return this.hasAttribute('show-tile-grid');
  }

  removeColourChangeListener() {
    this.colourChangeHandlerController?.abort();
    this.colourChangeHandlerController = null;
  }

  removeAndAddColourChangeListener() {
    this.removeColourChangeListener();
    this.colourChangeHandlerController = new AbortController();
    this.getRootNode().addEventListener(
      'colour-change',
      this.handleColourChange.bind(this),
      { capture: true, signal: this.colourChangeHandlerController.signal });
  }

  handleColourChange(ev) {
    if (ev.target.id !== this.colourPickerID) {
      return
    }
    this.colour = ev.detail;
  }

  updateDimensions() {
    if (this.width === 0) return;
    if (this.height === 0) return;
    if (this.width % 8 !== 0) {
      this.width = 8 * Math.ceil(this.width / 8);
      // I think this should cause an attributeChanged event.
      return;
    }
    if (this.height % 8 !== 0) {
      this.height = 8 * Math.ceil(this.height / 8);
      return;
    }
    this.drawGrid();

    this.twoBitCanvas.width = this.width;
    this.twoBitCanvas.height = this.height

    this.tileMap = TileMap.makeSimpleMap(this.width / 8, this.height / 8);
    //this.tileMap = TileMap.makeFullMap(this.width / 8, this.height / 8);
  }

  drawGrid() {
    const svgContainer = this.shadowRoot.getElementById('grid-container');
    svgContainer.replaceChildren();
    if (this.showTileGrid) {
      svgContainer.appendChild(getGridSVG(this.width / 8, this.height / 8));
    }
    if (this.showPixelGrid) {
      svgContainer.appendChild(getGridSVG(this.width, this.height));
    }
  }

  setColour(colourID) {
    this.colour = colourID;
  }

  setPixel(x, y, v) {
    if (x >= this.width || x < 0 || y >= this.height || y < 0) {
      return -1;
    }
    return this.tileMap.setPixel(x, y, v);
    return this.twoBitCanvas.setPixel(x, y, v);
  }

  drawLine(start, end) {
    this.changedTiles.add(this.setPixel(start.x, start.y, this.colour));
    if (start.x === end.x) {
      const [minY, maxY] = start.y < end.y ? [start.y, end.y] : [end.y, start.y];
      for (let y = minY; y <= maxY; y++) {
        this.changedTiles.add(this.setPixel(start.x, y, this.colour));
      }
      return;
    }
    const slope = (end.y - start.y) / (end.x - start.x);
    const xSign = Math.sign(end.x - start.x);
    let prev = start;
    for (let i = 1; i <= Math.abs(end.x - start.x); i++) {
      const x = start.x + (xSign * i);
      const y = Math.round(start.y + (xSign * i * slope));
      const ySign = Math.sign(y - prev.y);
      for (let j = 0; j < Math.abs(y - prev.y); j++) {
        const altX = Math.round(prev.x + (ySign * j / slope));
        this.changedTiles.add(this.setPixel(altX, prev.y + (ySign * j), this.colour));
      }
      prev = { x, y };
      this.changedTiles.add(this.setPixel(x, y, this.colour));
    }
  }

  connectedCallback() {
    this.twoBitCanvas.onpointerdown = this.pointerDownHandler.bind(this);
    this.twoBitCanvas.onpointerup = this.pointerUpHandler.bind(this);

    this.updateDimensions();
    const draw = () => {
      if (this.showPixelGrid || this.showTileGrid) {
        const grid = this.shadowRoot.querySelector('#grid-container > svg');
        grid?.replaceWith(grid);
      }
      if (this.needRedraw) {
        this.twoBitCanvas.setTwoBitData(this.tileMap.toPixelArray());
        if (this.changedTiles.size > 0) {
          this.dispatchEvent(new CustomEvent('needRedraw', { detail: this.changedTiles }));
          this.changedTiles = new Set();
        }
        this.needRedraw = false;
      }
      requestAnimationFrame(draw);
    };
    draw();
    if (this.selectedTile !== null) {
      //const tileIndex = this.tileMap.tileMap.tileMap[this.selectedTile];

      // doesn't seem to work, maybe when this happens nothing's there to
      // receive the event yet?
      this.dispatchEvent(new CustomEvent('tileSelected', { detail: this.selectedTile }));
    }
    const mql = window.matchMedia('(orientation: portrait');
    mql.addEventListener('change', this.drawGrid.bind(this));
  }

  disconnectedCallback() {
    this.removeColourChangeListener();
  }

  adoptedCallback() {
    if (this.colourPickerID) {
      this.removeAndAddColourChangeListener();
    } else {
      this.removeColourChangeListener();
    }
  }

  /**
   * Place the current selected tile at the tile position containing the
   * pixel-canvas coordinate x, y.
   */
  placeTile(x, y) {
      if (x < 0 || x >= this.width) return;
      if (y < 0 || y >= this.height) return;
      const tileIndex = this.tileMap.toMapIndex(x, y);
      if (this.tileMap.tileMap[tileIndex] === this.selectedTile) return;
      console.log(x, y);
      this.needRedraw = true;
      // This is a lie, but it makes sure that a redraw event is fired.
      this.changedTiles.add(this.selectedTile);
      this.tileMap.tileMap[tileIndex] = this.selectedTile;
  }

  pointerDownHandler(ev) {
    if (ev.button !== 0) return;

    const { x, y } = this.getMousePos(ev);
    if (this.tool === PENCIL) {
      this.needRedraw = true;
      const tileIndex = this.setPixel(x, y, this.colour);
      this.changedTiles.add(tileIndex);
      this.lastPoint = { x, y };
      this.twoBitCanvas.onpointermove = this.pointerMoveHandler.bind(this);
      this.twoBitCanvas.setPointerCapture(ev.pointerId);
    } else if (this.tool === TILE_SELECT) {
      // Use toTileXY to get the index of the tile that's displayed.
      const { tileIndex } = this.tileMap.toTileXY(x, y);
      this.selectedTile = tileIndex;
      this.dispatchEvent(new CustomEvent('tileSelected', { detail: tileIndex }));
      return;
    } else if (this.tool === TILE_PLACE) {
      this.placeTile(x, y);
      this.twoBitCanvas.onpointermove = this.pointerMoveHandler.bind(this);
      this.twoBitCanvas.setPointerCapture(ev.pointerId);
      return;
    }
  }

  pointerUpHandler(ev) {
    if (ev.button !== 0) return;
    const { x, y } = this.getMousePos(ev);
    this.twoBitCanvas.onpointermove = null;
    if (this.tool === PENCIL) {
      if (this.lastPoint === null) return;
      this.needRedraw = true;

      this.drawLine(this.lastPoint, { x, y });
      this.lastPoint = null;
    } else if (this.tool === TILE_PLACE) {
      this.placeTile(x, y);
    }
  }

  pointerMoveHandler(event) {
    if (this.tool === PENCIL) {
      this.needRedraw = true;
      if (event.getCoalescedEvents) {
        const events = event.getCoalescedEvents();
        if (events.length > 0) {
          for (let e of events) {
            const { x, y } = this.getMousePos(event);
            if (this.lastPoint.x === x && this.lastPoint.y === y) {
              continue;
            }
            this.drawLine(this.lastPoint, { x, y });
            this.lastPoint = { x, y };
          }
          return;
        }
      }
      const { x, y } = this.getMousePos(event);
      this.drawLine(this.lastPoint, { x, y });
      this.lastPoint = { x, y };
    } else if (this.tool === TILE_PLACE) {
      const { x, y } = this.getMousePos(event);
      this.placeTile(x, y);
    }
  }

  /**
   * Translates a mouse position to the position in the twoBitCanvas.
   * The |clientX| and |clientY| are properties of a pointer/mouse event.
   */
  getMousePos({ clientX, clientY }) {
    const rect = this.twoBitCanvas.getBoundingClientRect();
    return {
      x: convertCoordinate(clientX, rect.left, rect.width, this.twoBitCanvas.width),
      y: convertCoordinate(clientY, rect.top, rect.height, this.twoBitCanvas.height)
    };
  }

  getTiles() {
    return this.tileMap.tileSet;
  }

  updateTile(tileIndex) { 
    this.changedTiles.add(tileIndex);
    this.needRedraw = true;
  }

  setTwoBitData(twoBitData) {
    if (twoBitData.length != this.width * this.height) {
      return;
    }
    this.tileMap.tileSet
    this.twoBitCanvas.setTwoBitData(twoBitData);
  }

  getGBData() {
    return this.tileMap.toGBData();
  }

  fromGBData(tileMap, tiles) {
    this.tileMap.fromGBData(tileMap, tiles);
    this.needRedraw = true;
  }

  getB64JSONGBData() {
    const { map, tiles } = this.getGBData();
    const encodedGBData = {
      map: arrayBufferToBase64(map),
      tiles: arrayBufferToBase64(tiles),
    };
    return JSON.stringify(encodedGBData, null, 2);
  }

  getHexJSONData() {
    const { map, tiles } = this.getGBData();
    const encodedGBData = {
      map: arrayBufferToHexString(map, ',', '$'),
      tiles: arrayBufferToHexString(tiles, ',', '$'),
    };
    return JSON.stringify(encodedGBData, null, 2);
  }

  fromB64JSONGBData(jsonGBData) {
    const encodedGBData = JSON.parse(jsonGBData);
    this.fromGBData(base64ToUint8Array(encodedGBData.map),
    base64ToUint8Array(encodedGBData.tiles));
  }

  getNextTile() {
    const tileIndex = this.nextTile;
    this.selectedTile = tileIndex;
    this.nextTile++;
    this.dispatchEvent(new CustomEvent('tileSelected', { detail: tileIndex }));
  }
}
customElements.define('two-bit-drawing', TwoBitDrawing);

export {
  TwoBitDrawing,
  PENCIL,
  TILE_SELECT,
}