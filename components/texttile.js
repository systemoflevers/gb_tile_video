import { byteTileToGBTile, arrayBufferToHexString, arrayBufferToString } from '../modules/data_conversion.js';

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<div>
</div>
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
    this.container = shadow.querySelector('div');
    this.mode = Mode2BPPBin;
  }

  setTwoBitData(twoBitData) {
    this.twoBitData = twoBitData;
    this.redraw();
  }

  redraw() {
    if (this.mode === ModeZeroToThree) {
      const pixelLines = [];
      for (let i = 0; i < 8; ++i) {
        pixelLines.push(this.twoBitData.subarray(i * 8, (i + 1) * 8).join(''));
      }
      const pre = document.createElement('pre');
      pre.replaceChildren(pixelLines.join('\n'));
      this.container.replaceChildren(pre);
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
      const pre = document.createElement('pre');
      pre.replaceChildren(textLine.join('\n'));
      this.container.replaceChildren(pre);
      return;
    }
  }
}

customElements.define('text-tile', TextTile);