const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
#container {
  font-size: 3em;
  font-family: monospace;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#container div {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: fit-content;
  gap: 1em;
  position: absolute;
  position: absolute;
  transition: gap 1s, transform 1s;
  //transform: translateY(100%);
}
#low-bits {
  transform: translateX(0.6em);
}
#high-bits.colour {
  color: #E0A800;
}
#low-bits.colour {
  color: #015AA9;
}

.high-up {
  transform: translateY(-100%);
}
#high-bits.as-mem {
  transform: translateX(60%);
}
#low-bits.low-down {
  transform: translate(0.6em, 100%);
}
#low-bits.as-mem {
  transform: translateX(-60%);
}
#low-bits.as-bytes, #high-bits.as-bytes {
  gap: 0;
}
#low-bits.as-bytes:not(.as-mem) {
  transform: translateY(100%);
}
span {
  transition: opacity 1s, color 1s, transform 1s;
}
.emphasize span {
  transform: scale(1.5);
}
.hidden {
  opacity: 0;
}
</style>
<div id="container">
  <div id="high-bits">
   ${makeBits(0, 0, 0, 0, 1, 1, 1, 1)}
  </div>
  <div id="low-bits">
   ${makeBits(0, 0, 1, 1, 0, 0, 1, 1)}
  </div>
</div>
`;

function makeBits(...bitsVals) {
  const bits = [];
  for (let i = 0; i < 8; ++i) {
    bits.push(`<span>${bitsVals[i]}</span>`);
  }
  return bits.join('');
}

export class RowEncoding extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.row = 0;

    this.highBits = shadow.getElementById('high-bits');
    this.lowBits = shadow.getElementById('low-bits');
  }

  setRowIndex(i) {
    this.row = i;
    this.render();
  }

  setTileData(data) {
    this.tileData = data;
    this.render();
  }

  emphFirstByte() {
    const highBits = this.highBits.children;
    const lowBits = this.lowBits.children;
    for (let i = 4; i < 8; ++i) {
      highBits[i].className = 'hidden';
      lowBits[i].className = 'hidden';
    }
  }

  emphSecondByte() {
    const highBits = this.highBits.children;
    const lowBits = this.lowBits.children;
    for (let i = 0; i < 4; ++i) {
      highBits[i].className = 'hidden';
      lowBits[i].className = 'hidden';
    }
    for (let i = 4; i < 8; ++i) {
      highBits[i].className = '';
      lowBits[i].className = '';
    }
  }
  unemphBytes() {
    const highBits = this.highBits.children;
    const lowBits = this.lowBits.children;
    for (let i = 0; i < 8; ++i) {
      highBits[i].className = '';
      lowBits[i].className = '';
    }
    this.lowBits.classList.remove('emphasize');
    this.highBits.classList.remove('emphasize');
  }

  emphHighBits() {
    this.lowBits.classList.remove('emphasize');
    this.highBits.classList.add('emphasize');
  }
  emphLowBits() {
    this.lowBits.classList.add('emphasize');
    this.highBits.classList.remove('emphasize');
  }

  render() {
    if (!this.tileData) return;
    const lowBits = [];
    const highBits = [];
    const startIndex = this.row * 8;
    for (let i = startIndex; i < startIndex + 8; ++i) {
      lowBits.push(`<span>${this.tileData[i] & 1}</span>`);
      highBits.push(`<span>${(this.tileData[i] >> 1) & 1}</span>`);
    }
    this.lowBits.innerHTML = lowBits.join('');
    this.highBits.innerHTML = highBits.join('');
  }
  
  colourBits() {
    this.shadowRoot.getElementById('low-bits').classList.add('colour');
    this.shadowRoot.getElementById('high-bits').classList.add('colour');
  }

  splitBits() {
    this.shadowRoot.getElementById('low-bits').classList.add('low-down');
    this.shadowRoot.getElementById('high-bits').classList.add('high-up');
  }

  asSplitBytes() {
    this.lowBits.classList.add('as-bytes');
    this.highBits.classList.add('as-bytes');
  }

  asMem() {

    this.lowBits.classList.add('as-mem');
    this.highBits.classList.add('as-mem');
  }
  hideZeros() {
    for (let i = 0; i < 8; ++i) {
      if (this.lowBits.children[i].innerText === '0') {
        this.lowBits.children[i].classList.add('hidden');
      }
      if (this.highBits.children[i].innerText === '0') {
        this.highBits.children[i].classList.add('hidden');
      }
    }
  }
}
customElements.define('row-encoding', RowEncoding);