const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    margin: auto;
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: repeat(8, 1fr);
    justify-items: center;
    align-items: center;
    font-family: monospace;
    transition: width 1s, height 1s;
  }
  #container.bytes {
    width: fit-content;
    height: auto;
  }
  #container.bytes div.second-byte {
    transform: translateX(50%);
  }
  #container.bytes div:not(.second-byte) {
    transform: translateX(-50%);
  }

  #container div {
    transition: transform 0.5s, width 1s;
  }
  #container.right div :nth-child(1) {
    opacity: 0;
  }
  #container.right div :nth-child(2) {
    opacity: 1;
  }
  #container.left div :nth-child(1) {
    opacity: 1;
  }
  #container.left div :nth-child(2) {
    opacity: 0;
  }
  /*#container div {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }*/
</style>
<div id=container>
    ${makePixels()}
</div>
`;

function makePixels() {
  const pixels = [];
  for (let i = 0; i < 64; ++i) {
    let div = '<div>0</div>';
    if (i % 8 > 3) {
      div = '<div class="second-byte">0</div>';
    }
    pixels.push(div);
  }
  return pixels.join('\n');
}

export class TextGridTile extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.emphasisStyle = new CSSStyleSheet();
    shadow.adoptedStyleSheets = [ this.emphasisStyle]
    this.pixelData = new Uint8Array(64);
    this.base = 10;
  }

  setBase(base) {
    this.base = base;
    this.renderTile();
  }

  setPixelData(tbppPixelData) {
    this.pixelData = tbppPixelData;
    this.renderTile();
  }

  renderTile() {
    const pixels = this.shadowRoot.querySelectorAll('#container div');
    for (let i = 0; i < 64; ++i) {
      const children = [];
      const text = this.renderPixel(i);
      for (const digit of text) {
        const span = document.createElement('span');
        span.innerText = digit;
        children.push(span)
      }
      pixels[i].replaceChildren(...children);
    }
  }

  renderPixel(i) {
    const p = this.pixelData[i];
    let text = p.toString(this.base);
    if (this.base > 3) return text;
    if (text.length >= 2) return text;
    return `0${text}`;
  }

  toByteFormat() {
    this.shadowRoot.getElementById('container').classList.add('bytes');
  }
  toGridFormat() {
    this.shadowRoot.getElementById('container').classList.remove('bytes');
  }

  makeLeft() {
    this.shadowRoot.getElementById('container').classList.remove('right');
    this.shadowRoot.getElementById('container').classList.add('left');
  }
  makeRight() {
    this.shadowRoot.getElementById('container').classList.remove('left');
    this.shadowRoot.getElementById('container').classList.add('right');
  }
  makeBoth() {
    this.shadowRoot.getElementById('container').classList.remove('left');
    this.shadowRoot.getElementById('container').classList.remove('right');
  }



  emphasizeOnePixel(x, y) {
    const index = x + (y * 8);
    emphasizeOnePixelByIndex(index);
  }
  emphasizeOnePixelByIndex(index) {
    this.emphasisStyle.replace(`#container > :nth-child(${index + 1}) {
      font-weight: bold; transform: scale(1.5);
    }`);
  }
}
customElements.define('text-grid-tile', TextGridTile);