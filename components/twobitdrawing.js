import {TwoBitCanvas} from './twobitcanvas.js';

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

export class TwoBitDrawing extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));
    }
}
customElements.define('two-bit-drawing', TwoBitDrawing);