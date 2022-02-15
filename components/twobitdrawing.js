import { TwoBitCanvas } from './twobitcanvas.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: inline-block;
}
two-bit-canvas {
    border-style: solid;
    width: 90vmin;
    height: auto;
}
</style>
<two-bit-canvas width="160" height="144"></two-bit-canvas>
`;

function convertCoordinate(point, origin, boundingLength, pixelLength) {
    const v = Math.floor(((point - origin) / boundingLength) * pixelLength);
    console.log(point, origin, boundingLength, pixelLength, (point - origin), v);
    return v;
}

export class TwoBitDrawing extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
        this.twoBitCanvas = shadow.querySelector('two-bit-canvas');
        this.isPointerDown = false;
    }

    connectedCallback() {
        this.twoBitCanvas.onpointerdown = (event) => {
            const { x, y } = this.getMousePos(event);
            this.twoBitCanvas.setPixel(x, y, 0);
            this.twoBitCanvas.onpointermove = (event) => {
                if (event.getCoalescedEvents) {
                    const events = event.getCoalescedEvents();
                    if (events.length > 0) {
                        for (let e of events) {
                            const { x, y } = this.getMousePos(event);
                            this.twoBitCanvas.setPixel(x, y, 0);
                        }
                        return;
                    }
                }
                const { x, y } = this.getMousePos(event);
                this.twoBitCanvas.setPixel(x, y, 0);
            }
        };
        this.twoBitCanvas.onpointerup = (event) => {
            const { x, y } = this.getMousePos(event);
            this.twoBitCanvas.setPixel(x, y, 0);
            this.twoBitCanvas.onpointermove = null;
        };
    }

    getMousePos(event) {
        const rect = this.twoBitCanvas.getBoundingClientRect();
        return {
            x: convertCoordinate(event.clientX, rect.left, rect.width, this.twoBitCanvas.width),
            y: convertCoordinate(event.clientY, rect.top, rect.height, this.twoBitCanvas.height)
        };
    }
}
customElements.define('two-bit-drawing', TwoBitDrawing);