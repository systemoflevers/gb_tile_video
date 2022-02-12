const template = document.createElement('template');
template.innerHTML = `
<style>
canvas {
    width: 90vmin;
    height: auto;
    image-rendering: pixelated;
    border-style: solid;  
  }
</style>
<canvas></canvas>
`;


const WIDTH = 160;
const HEIGHT = 144;

const colours = [[0,0,0], [85, 85, 85], [171,171,171], [255,255,255]];
function convertCoordinate(point, origin, boundingLength, pixelLength) {
  const v = Math.floor(((point - origin) / boundingLength) * pixelLength);
  console.log(point, origin, boundingLength, pixelLength, (point - origin), v);
  return v;
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: convertCoordinate(event.clientX, rect.left, rect.width, WIDTH),
        y: convertCoordinate(event.clientY, rect.top, rect.height, HEIGHT)
    };
}

function doStuff() {
  const canvas = document.querySelector("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(WIDTH, HEIGHT);
  
  const setPixel = (x, y, r, g, b) => {
    const baseIndex = ((y * WIDTH) + x) * 4;
    imageData.data[baseIndex] = r;
    imageData.data[baseIndex+1] = g;
    imageData.data[baseIndex+2] = b;
    imageData.data[baseIndex+3] = 255; // alpha
  };
  canvas.addEventListener('click', (event) => {
    const {x, y} = getMousePos(canvas, event);
    setPixel(x, y, 0, 0, 0);
    ctx.putImageData(imageData, 0, 0);
  });

  return;
}
class TwoBitCanvas extends HTMLElement {
    constructor () {
        super();

        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));

        this.canvas = shadow.querySelector('canvas');
        this.canvas.width = WIDTH;
        this.canvas.height = HEIGHT;

        const ctx = this.canvas.getContext('2d');
        const imageData = ctx.createImageData(WIDTH, HEIGHT);

        const setPixel = (x, y, r, g, b) => {
            const baseIndex = ((y * WIDTH) + x) * 4;
            imageData.data[baseIndex] = r;
            imageData.data[baseIndex+1] = g;
            imageData.data[baseIndex+2] = b;
            imageData.data[baseIndex+3] = 255; // alpha
        };
        this.canvas.addEventListener('click', (event) => {
            const {x, y} = getMousePos(this.canvas, event);
            setPixel(x, y, 0, 0, 0);
            ctx.putImageData(imageData, 0, 0);
        });
    }
}

customElements.define('two-bit-canvas', TwoBitCanvas);