const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<pre>
</pre>
`;

export class TextTile extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.container = shadow.querySelector('pre');
  }

  setTwoBitData(twoBitData) {
    const pixelLines = [];
    for (let i = 0; i < 8; ++i) {
      pixelLines.push(twoBitData.subarray(i * 8, (i + 1) * 8).join(''));
    }
    this.container.replaceChildren(pixelLines.join('\n'));
  }
}

customElements.define('text-tile', TextTile);