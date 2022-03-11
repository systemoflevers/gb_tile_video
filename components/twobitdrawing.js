import { TwoBitCanvas } from './twobitcanvas.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: block;
  position: relative;
}
two-bit-canvas {
    cursor: crosshair;
    width: 100%;
    touch-action: pinch-zoom;
}
#colour-picker {
    position: absolute;
    //margin-top: 5px;
    width: 63%;
}

#colour-picker input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

#colour-picker input:checked ~ label>div {
    /*border-color: white;*/
    /* border-style: solid; */
    border-width: 4px;
    padding-bottom: 0%;
    /* border-color: white; */
    margin-bottom: 3%;
    
}
#colour-picker div {
    //width: calc(0.1 * var(--base-width));
    width: 10%;
    aspect-ratio: 1;
    display: inline-block;
    //padding: 3px;
    //box-sizing: border-box;
}
#swatch-0 {
    background-color: rgb(224, 248, 208);
    border-color: rgb(52, 104, 86);
}
#swatch-1 {
    background-color: rgb(136, 192, 112);
    border-color: rgb(8, 24, 32);
}
#swatch-2 {
    background-color: rgb(52, 104, 86);
    border-color: rgb(224, 248, 208);
}
#swatch-3{
    background-color: rgb(8, 24, 32);
    border-color: rgb(136, 192, 112);
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
        this.lastPoint = null;
        this.needRedraw = false;
        this.changedTiles = new Set();
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
        if (this.width % 8 !== 0) {
            this.width = 8 * Math.ceil(this.width / 8);
            // I think this should cause an attributeChanged event.
            return;
        }
        if (this.height % 8 !== 0) {
            this.height = 8 * Math.ceil(this.height / 8);
            return;
        }
        this.twoBitCanvas.width = this.width;
        this.twoBitCanvas.height = this.height
    }

    drawLine(start, end) {
        this.changedTiles.add(this.twoBitCanvas.setPixel(start.x, start.y, this.colour));
        if (start.x === end.x) {
            const [minY, maxY] = start.y < end.y ? [start.y, end.y] : [end.y, start.y];
            for (let y = minY + 1; y <= maxY; y++) {
                this.changedTiles.add(this.twoBitCanvas.setPixel(start.x, y, this.colour));
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
                this.changedTiles.add(this.twoBitCanvas.setPixel(altX, prev.y + (ySign * j), this.colour));
            }
            prev = { x, y };
            this.changedTiles.add(this.twoBitCanvas.setPixel(x, y, this.colour));
        }
    }

    connectedCallback() {
        this.twoBitCanvas.onpointerdown = this.pointerDownHandler.bind(this);
        this.twoBitCanvas.onpointerup = this.pointerUpHandler.bind(this);

        const draw = () => {
            if (this.needRedraw) {
                this.twoBitCanvas.redrawCanvas();
                this.needRedraw = false;
                this.dispatchEvent(new CustomEvent('needRedraw', {detail: this.changedTiles}));
                this.changedTiles = new Set();
            }
            requestAnimationFrame(draw);
        };
        draw();
    }

    pointerDownHandler(ev) {
        if (ev.button !== 0) return;
        this.needRedraw = true;
        const { x, y } = this.getMousePos(ev);
        const tileIndex = this.twoBitCanvas.setPixel(x, y, this.colour);
        this.changedTiles.add(tileIndex);
        this.lastPoint = { x, y };
        this.twoBitCanvas.onpointermove = this.pointerMoveHandler.bind(this);
        this.twoBitCanvas.setPointerCapture(ev.pointerId);
    }

    pointerUpHandler(ev) {
        if (ev.button !== 0) return;
        if (this.lastPoint === null) return;
        this.needRedraw = true;
        const { x, y } = this.getMousePos(ev);

        this.drawLine(this.lastPoint, { x, y });
        this.lastPoint = null;
        this.twoBitCanvas.onpointermove = null;
    }

    pointerMoveHandler(event) {
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
    }

    getMousePos(event) {
        const rect = this.twoBitCanvas.getBoundingClientRect();
        return {
            x: convertCoordinate(event.clientX, rect.left, rect.width, this.twoBitCanvas.width),
            y: convertCoordinate(event.clientY, rect.top, rect.height, this.twoBitCanvas.height)
        };
    }

    getTiles() {
        return this.twoBitCanvas.getTiles();
    }
}
customElements.define('two-bit-drawing', TwoBitDrawing);