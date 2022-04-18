import { byteTileToGBTile, arrayBufferToHexString, arrayBufferToString } from '../modules/data_conversion.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<pre>
</pre>
`;

const ModeZeroToThree = 'ZeroToThree';
const Mode2BPPBin = '2BPPBin';
const Mode2BPPDec = '2BPPDec';
const Mode2BPPHex = '2BPPHex';

export class TextTile extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.container = shadow.querySelector('pre');
    this.mode = Mode2BPPBin;
  }

  setTwoBitData(twoBitData) {
    this.twoBitData = twoBitData;
    this.redraw();
  }

  useZeroToThreeMode() {
    this.mode = ModeZeroToThree;
    this.redraw();
  }

  use2BPPMode(base) {
    switch (base) {
      case (2):
        this.mode = Mode2BPPBin;
        break;
      case (10):
        this.mode = Mode2BPPDec;
        break;
      case (16):
        this.mode = Mode2BPPHex;
        break;
      default:
        throw new RangeError('base must be 2, 10, or 16');
    }
    this.redraw();
  }

  redraw() {
    if (this.mode === ModeZeroToThree) {
      const pixelLines = [];
      for (let i = 0; i < 8; ++i) {
        pixelLines.push(this.twoBitData.subarray(i * 8, (i + 1) * 8).join(''));
      }
      this.container.replaceChildren(pixelLines.join('\n'));
      return;
    }

    if (this.mode.startsWith('2BPP')) {
      let base = 10;
      switch (this.mode) {
        case (Mode2BPPBin):
          base = 2;
          break;
        case (Mode2BPPDec):
          base = 10;
          break;
        case (Mode2BPPHex):
          base = 16;
          break;
      }
      const tbpp = byteTileToGBTile(this.twoBitData);
      const textLine = [];
      for (let i = 0; i < 8; ++i) {
        const rowBytes = tbpp.subarray(i * 2, (i + 1) * 2);
        textLine.push(arrayBufferToString(rowBytes, base, ' '));
      }
      this.container.replaceChildren(textLine.join('\n'));
      return;
    }
  }
}

customElements.define('text-tile', TextTile);