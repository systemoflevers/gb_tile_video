import { pixelArrayToTiles, arrayBufferToHexString, arrayBufferToBase64, base64ToUint8Array } from '../modules/data_conversion.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: inline-block;
}

canvas {
    width: 100%;
    image-rendering: pixelated;
  }
</style>
<canvas></canvas>
`;

const green_colours = [
    [155, 188, 15],
    [139, 172, 15],
    [48, 98, 48],
    [15, 56, 15],
];
const green2_colours = [
    [224, 248, 208],
    [136, 192, 112],
    [52, 104, 86],
    [8, 24, 32],
];
const grey_colours = [
    [255, 255, 255],
    [171, 171, 171],
    [85, 85, 85],
    [0, 0, 0],
];
const colours = green2_colours;

export class TwoBitCanvas extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        this.canvas = shadow.querySelector('canvas');

        const ctx = this.canvas.getContext('2d');
        //const imageData = ctx.createImageData(this.width, this.height);
        //this.imageData = imageData;
        this.ctx = ctx;
        this.colours = [...colours];
        if (this.width && this.height) {
            this.updateDimensions();
        }

    }

    connectedCallback() {
        console.log('connected', this.getAttribute('width'), this.height);
    }

    static get observedAttributes() { return ['width', 'height']; }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
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

    updateDimensions() {
        if (this.width === 0) return;
        if (this.height === 0) return;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.twoBitData = new Uint8Array(this.width * this.height);
        this.redrawCanvas();
    }

    setTwoBitData(twoBitData) {
        if (twoBitData.length != this.width * this.height) {
            return;
        }
        this.twoBitData = twoBitData;
        this.redrawCanvas();
    }

    setTwoBitDataFromB64(b64Data) {
        this.setTwoBitData(base64ToUint8Array(b64Data))
    }

    redrawCanvas() {
        for (let i = 0; i < this.twoBitData.length; i++) {
            const [r, g, b] = this.colours[this.twoBitData[i]];
            this.imageData.data[i * 4] = r;
            this.imageData.data[i * 4 + 1] = g;
            this.imageData.data[i * 4 + 2] = b;
            this.imageData.data[i * 4 + 3] = 255; // alpha
        }
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    /**
     * Updates the data model without updating the canvas.
     * @param x 
     * @param y 
     * @param v 
     * @returns The index of the tile containing the pixel.
     */
    setPixel(x, y, v) {
        if (x >= this.width || x < 0 || y >= this.height || y < 0) {
            return -1;
        }
        this.twoBitData[y * this.width + x] = v;
        return Math.floor(x/8) + Math.floor(y/8) * this.width/8;
    }

    drawPixel(x, y, v) {
        this.setPixel(x, y, v);
        const baseIndex = ((y * this.width) + x) * 4;
        const [r, g, b] = colours[v];
        this.imageData.data[baseIndex] = r;
        this.imageData.data[baseIndex + 1] = g;
        this.imageData.data[baseIndex + 2] = b;
        this.imageData.data[baseIndex + 3] = 255; // alpha
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    getB64ByteEncodedPixels() {
        return arrayBufferToBase64(this.twoBitData);
    }

    getTiles() {
        return pixelArrayToTiles(this.twoBitData, this.width, this.height);
    }

    getGBDataAsHex() {
        const tiles = pixelArrayToTiles(this.twoBitData, this.width, this.height);
        return arrayBufferToHexString(tiles.toGBTileData().buffer, ' ');
    }

    getGBDataAsB64() {
        const tiles = pixelArrayToTiles(this.twoBitData, this.width, this.height);
        return arrayBufferToBase64(tiles.toGBTileData().buffer, ' ');
    }
}

customElements.define('two-bit-canvas', TwoBitCanvas);