class TwoBitCanvas extends HTMLElement {
    constructor () {
        super();

        const shadow = this.attachShadow({mode: 'closed'});
        const content = document.createElement('p');
        content.textContent = "hello";
        shadow.appendChild(content);
    }
}

customElements.define('two-bit-canvas', TwoBitCanvas);