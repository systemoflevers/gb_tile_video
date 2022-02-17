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
    touch-action: none;
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
    //console.log(point, origin, boundingLength, pixelLength, (point - origin), v);
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
    }

    drawLine(start, end) {
        this.twoBitCanvas.setPixel(start.x, start.y, this.colour);
        if (start.x === end.x) {
            const [minY, maxY] = start.y < end.y ? [start.y, end.y] : [end.y, start.y];
            for (let y = minY + 1; y <= maxY; y++) {
                this.twoBitCanvas.setPixel(start.x, y, this.colour);
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
            console.log(Math.abs(y - prev.y) - 1, prev, x, y, xSign, slope, i);
            for (let j = 0; j < Math.abs(y - prev.y); j++) {
                console.log(prev, x, y, ySign, j, prev.x, prev.y + (ySign * j));
                const altX = Math.round(prev.x + (ySign * j / slope));
                this.twoBitCanvas.setPixel(altX, prev.y + (ySign * j), this.colour);
            }
            prev = { x, y };
            this.twoBitCanvas.setPixel(x, y, this.colour);
        }
    }

    connectedCallback() {
        this.twoBitCanvas.onpointerdown = this.pointerDownHandler.bind(this);
        this.twoBitCanvas.onpointerup = this.pointerUpHandler.bind(this);

        const draw = () => {
            this.twoBitCanvas.redrawCanvas();
            requestAnimationFrame(draw);
        };
        draw();
    }

    pointerDownHandler(ev) {
        if (ev.button !== 0) return;
        const { x, y } = this.getMousePos(ev);
        this.twoBitCanvas.setPixel(x, y, this.colour);
        this.lastPoint = { x, y };
        this.twoBitCanvas.onpointermove = this.pointerMoveHandler.bind(this);
    }

    pointerUpHandler(ev) {
        if (ev.button !== 0) return;
        if (this.lastPoint === null) return;
        const { x, y } = this.getMousePos(ev);

        this.drawLine(this.lastPoint, { x, y });
        this.lastPoint = null;
        //this.twoBitCanvas.setPixel(x, y, this.colour);
        this.twoBitCanvas.onpointermove = null;
    }

    pointerMoveHandler(event) {
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
}
customElements.define('two-bit-drawing', TwoBitDrawing);