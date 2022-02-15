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

const colours = [[0,0,0], [85, 85, 85], [171,171,171], [255,255,255]];
function convertCoordinate(point, origin, boundingLength, pixelLength) {
  const v = Math.floor(((point - origin) / boundingLength) * pixelLength);
  console.log(point, origin, boundingLength, pixelLength, (point - origin), v);
  return v;
}


export class TwoBitCanvas extends HTMLElement {
    constructor () {
        super();

        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));

        this.canvas = shadow.querySelector('canvas');

        const ctx = this.canvas.getContext('2d');
        const imageData = ctx.createImageData(this.width, this.height);
        this.imageData = imageData;
        this.ctx = ctx;
        this.updateDimensions();

        this.canvas.addEventListener('click', (event) => {
            const {x, y} = this.getMousePos(event);
            this.setPixel(x, y, 0);
        });
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
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      
      this.imageData = this.ctx.createImageData(this.width, this.height);
    }

    setPixel(x, y, v) {
      const baseIndex = ((y * this.width) + x) * 4;
      const [r, g, b] = colours[v];
      this.imageData.data[baseIndex] = r;
      this.imageData.data[baseIndex+1] = g;
      this.imageData.data[baseIndex+2] = b;
      this.imageData.data[baseIndex+3] = 255; // alpha
      this.ctx.putImageData(this.imageData, 0, 0);
    }

    getMousePos(event) {
      const rect = this.canvas.getBoundingClientRect();
      return {
          x: convertCoordinate(event.clientX, rect.left, rect.width, this.width),
          y: convertCoordinate(event.clientY, rect.top, rect.height, this.height)
      };
    }
}

customElements.define('two-bit-canvas', TwoBitCanvas);