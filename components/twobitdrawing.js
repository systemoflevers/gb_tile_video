import { TwoBitCanvas } from './twobitcanvas.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: inline-block;
}
two-bit-canvas {
    cursor: crosshair;
    width: 100%;
}
#colour-picker div {
    width: 1em;
    height: 1em;
    display: inline-block;
}
#swatch-0 {
    background-color: rgb(224, 248, 208);
}
#swatch-1 {
    background-color: rgb(136, 192, 112);
}
#swatch-2 {
    background-color: rgb(52, 104, 86);
}
#swatch-3{
    background-color: rgb(8, 24, 32);
}
</style>
<two-bit-canvas width="160" height="144"></two-bit-canvas>
<div id="colour-picker">
<span><input type="radio" name="colour" id="c0" value="0" />
<label for="c0"><div id="swatch-0"></div></label></span>
<span><input type="radio" name="colour" id="c1" value="1" /><label for="c1"><div id="swatch-1"></div></label></span>
<span><input type="radio" name="colour" id="c2" value="2" /><label for="c2"><div id="swatch-2"></div></label></span>
<span><input type="radio" name="colour" id="c3" value="3" checked /><label for="c3"><div id="swatch-3"></div></label></span>
</div>
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
        this.colour = 3;

        const pickerDiv = shadow.getElementById('colour-picker');
        pickerDiv.addEventListener('change', (event) => {
            this.colour = parseInt(event.target.value);
        });
    }

    connectedCallback() {
        this.twoBitCanvas.onpointerdown = (event) => {
            const { x, y } = this.getMousePos(event);
            this.twoBitCanvas.setPixel(x, y, this.colour);
            this.twoBitCanvas.onpointermove = (event) => {
                if (event.getCoalescedEvents) {
                    const events = event.getCoalescedEvents();
                    if (events.length > 0) {
                        for (let e of events) {
                            const { x, y } = this.getMousePos(event);
                            this.twoBitCanvas.setPixel(x, y, this.colour);
                        }
                        return;
                    }
                }
                const { x, y } = this.getMousePos(event);
                this.twoBitCanvas.setPixel(x, y, this.colour);
            }
        };
        this.twoBitCanvas.onpointerup = (event) => {
            const { x, y } = this.getMousePos(event);
            this.twoBitCanvas.setPixel(x, y, this.colour);
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