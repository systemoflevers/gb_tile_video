import { TextGridTile } from "./textgridtile.js";
import { TwoBitDrawing } from "../twobitdrawing.js";
import { TileMask } from "./tilemask.js";
import { RowEncoding } from "./rowencoding.js";
import { AnimationController, PresetAnimation } from "../../modules/animation_controller.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-content: center;
    align-items: center;
    height: 100%;
    gap: 1em;
    position: relative;
  }
  two-bit-drawing {
    grid-row: 1;
    grid-column: 2;
  }
  row-encoding {
    grid-row: 1;
    grid-column: 2;
    z-index: 3;
    transition: opacity 1s, transform 1s;
  }
  row-encoding.hidden {
    opacity: 0;
  }
  /*#text-tile-container {
    position: relative;
    height: 100%;
  }*/
  .text-container {
    grid-row: 1;
    grid-column: 3;

  }
  text-grid-tile {
    grid-row: 1;
    width: 100%;
    /*aspect-ratio: 1;
    position: absolute;*/
    grid-column: 2;
    font-size: 200%;
    transition: opacity 1s, transform 1s;
    z-index: 2;
    mix-blend-mode: difference;
    color: white;
  }
  text-grid-tile.hidden {
    opacity: 0;
  }
  .move-left {
    transform: translateX(calc(2 * (-100% - 0.5em)));
  }
  tile-mask {
    z-index: 3;
    grid-row: 1;
    grid-column: 2;
    width: 100%;
  }
  #explainer-container {
    height: 100%;
  }
  #explainer-container {
    grid-column: 3;
    height: 100%;
    position: relative;
  }
  #explainer-container > div {
    position: absolute;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    transition: transform 1s, opacity 1s;
  }
  #explain-binary {
    display: flex;
    flex-direction: column;
    font-size: 4em;
    font-family: monospace;
  }
  #size-arithmetic {
    display: grid;
    font-size: 2em;
    font-family: monospace;
    grid-template-columns: 5fr 1fr 5fr;
    row-gap: 30px;
    justify-items: center;
    align-content: center;
  }
  #size-arithmetic span {
    transition: opacity 1s;
    opacity: 0;
  }
  #explainer-container div.away-top {
    transition: transform 1s;
    transform: translateY(-200%);
  }
  #explainer-container div.away-bottom {
    transition: transform 1s;
    transform: translateY(200%);
  }
  .align-left {
    justify-self: left;
  }
  .align-right {
    justify-self: end;
  }
  #all-row-encodings {
    grid-row: 1;
    grid-column: 3;
    height: 100%;
    width: 100%;
    display: grid;
    transition: opacity 1s, transform 1s;
  }
  #all-row-encodings.hidden {
    opacity: 0;
  }
  #all-row-encodings.away-right {
    transform: translateX(150%);
  }
  #all-row-encodings row-encoding {
    grid-column: unset;
    grid-row: unset;
  }
</style>
<div id="container">
  <two-bit-drawing id="main-tile" height="8" width="8"></two-bit-drawing>
  <!--div id="text-tile-container"-->
  <text-grid-tile class="hidden"></text-grid-tile>
  <tile-mask></tile-mask>
  <div id="explainer-container">
    <div id="explain-binary" class="away-top">
      <div>
        0 ➡ 00
      </div>
      <div>
        1 ➡ 01
      </div>
      <div>
        2 ➡ 10
      </div>
      <div>
        3 ➡ 11
      </div>
    </div>
    <div id="size-arithmetic" class="away-top">
      <span class="align-right">8 x 8</span><span>=</span><span class="align-left">64 pixels</span>
      <span class="align-right">64 x 2 bits</span><span>=</span><span class="align-left">128 bits</span>
      <span class="align-right">128 bits</span><span>=</span><span class="align-left">16 bytes</span>
      <span class="align-right">1 row</span><span>=</span><span class="align-left">2 bytes</span>
    </div>
    <div id="all-row-encodings" class="hidden">
      <row-encoding></row-encoding>
      <row-encoding></row-encoding>
      <row-encoding></row-encoding>
      <row-encoding></row-encoding>
      <row-encoding></row-encoding>
      <row-encoding></row-encoding>
      <row-encoding></row-encoding>
      <row-encoding></row-encoding>
    </div>
  </div>
  <row-encoding id="main-row-encoding" class="hidden"></row-encoding>
  <row-encoding id="background-row-encoding" class="hidden"></row-encoding>
</div>
`;

const kAlternatingTile = new Uint8Array([0, 0, 1, 1, 2, 2, 3, 3, 0, 1, 1, 2, 2, 3, 3, 0, 1, 1, 2, 2, 3, 3, 0, 0, 1, 2, 2, 3, 3, 0, 0, 1, 2, 2, 3, 3, 0, 0, 1, 1, 2, 3, 3, 0, 0, 1, 1, 2, 3, 3, 0, 0, 1, 1, 2, 2, 3, 0, 0, 1, 1, 2, 2, 3]);
const kFacePartOne = new Uint8Array([0, 1, 1, 1, 3, 3, 3, 2, 3, 2, 1, 2, 2, 3, 3, 0, 3, 1, 2, 2, 3, 3, 0, 0, 3, 2, 2, 3, 3, 0, 0, 1, 3, 2, 3, 3, 0, 0, 1, 1, 3, 3, 3, 0, 0, 1, 1, 2, 3, 3, 0, 0, 1, 1, 2, 2, 3, 0, 0, 1, 1, 2, 2, 3]);
const kFacePartTwo = new Uint8Array([0, 3, 3, 3, 3, 3, 3, 0, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 0, 0, 3, 0, 3, 3, 0, 1, 0, 0, 1, 0, 3, 3, 0, 0, 2, 2, 0, 0, 3, 3, 0, 1, 3, 3, 1, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 3, 3, 3, 0]);

export class TileEncoding extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }

  connectedCallback() {
    this.drawing = this.shadowRoot.getElementById('main-tile');
    this.setTile(kAlternatingTile);
    this.gridText = this.shadowRoot.querySelector('text-grid-tile');
    this.tileMask = this.shadowRoot.querySelector('tile-mask');
    this.rowEncoding = this.shadowRoot.getElementById('main-row-encoding');
    this.backgroundRowEncoding =
      this.shadowRoot.getElementById('background-row-encoding');
    this.allRows = this.shadowRoot.getElementById('all-row-encodings');
    for (let i = 0; i < 8; ++i) {
      const row = this.allRows.children[i];
      row.setRowIndex(i)
      row.colourBits();
      row.splitBits();
      row.asSplitBytes();
      row.asMem();
    }
    this.drawing.addEventListener('needRedraw', () => {
      this.gridText.setPixelData(this.drawing.twoBitCanvas.twoBitData);
      this.rowEncoding.setTileData(this.drawing.twoBitCanvas.twoBitData);
      this.backgroundRowEncoding.setTileData(
        this.drawing.twoBitCanvas.twoBitData);
      for (const row of this.allRows.children) {
        row.setTileData(this.drawing.twoBitCanvas.twoBitData);
      }
    });

    const readyEvent = new CustomEvent('ready', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(readyEvent);
  }
  setTile(tbpp) {
    this.drawing.tileMap.tileSet.setTile(0, tbpp);
    this.drawing.updateTile(0);
    this.drawing.needRedraw = true;
  }
  showNumbers() {
    this.gridText.className = '';
  }

  toBinaryValues() {
    const toBin = (t) => {
      t.style = 'opacity: 0';
      const transEnd = () => {
        t.setBase(2);
        t.style = '';
        t.removeEventListener('transitionend', transEnd);
      };
      t.addEventListener('transitionend', transEnd);
    };
    toBin(this.gridText);
  }
  toDecimalValues() {
    this.leftText.setBase(10);
    this.rightText.setBase(10);
  }

  explainBinary() {
    this.shadowRoot.getElementById('explain-binary').className = '';
  }
  explainSizesArithmetic() {
    this.shadowRoot.getElementById('explain-binary').className = 'away-bottom';
    this.shadowRoot.getElementById('size-arithmetic').className = '';
  }
  showSizesLine(i) {
    for (let j = 1; j <= 3; ++j) {
      const index = i * 3 + j;
      this.shadowRoot
        .querySelector(`#size-arithmetic span:nth-child(${index})`)
        .style.opacity = 1;
    }
  }
  doneArithmetic() {
    this.shadowRoot.getElementById('size-arithmetic').className = 'away-bottom';
  }
  hideAllBut1Row() {
    for (let y = 0; y < 8; ++y) {
      if (y === 0) continue;
      for (let x = 0; x < 8; ++x) {
        this.tileMask.setPixel(x, y, true);
      }
    }
  }
  showRowEncoding() {
    this.rowEncoding.className = '';
  }

  emphFirstFour() {
    for (let i = 4; i < 8; ++i) {
      this.tileMask.setPixel(i, 0, true);
    }
    this.rowEncoding.emphFirstByte();
  }
  emphSecondFour() {
    for (let i = 0; i < 8; ++i) {
      this.tileMask.setPixel(i, 0, i < 4);
    }
    this.rowEncoding.emphSecondByte();
  }
  unemph() {
    for (let i = 0; i < 8; ++i) {
      this.tileMask.setPixel(i, 0, false);
    }
    this.rowEncoding.unemphBytes();
    this.backgroundRowEncoding.unemphBytes();
  }
  colours() {
    this.backgroundRowEncoding.className = '';
    this.backgroundRowEncoding.colourBits();
    this.rowEncoding.colourBits();
  }
  splitBits() {
    this.rowEncoding.splitBits();
  }
  asBytes() {
    this.rowEncoding.asSplitBytes();
  }
  asMem() {
    this.rowEncoding.style.transform = 'translateY(3em)';
    this.rowEncoding.asMem();
  }

  emphLowBits() {
    this.rowEncoding.emphLowBits();
    this.backgroundRowEncoding.emphLowBits();
  }
  changeTile() {
    this.setTile(kFacePartOne);
  }
  emphHighBits() {
    this.rowEncoding.emphHighBits();
    this.backgroundRowEncoding.emphHighBits();
  }
  changeTile2() {
    this.setTile(kFacePartTwo);
  }
  fullTileEncoding() {
    this.rowEncoding.classList.add('hidden');
    this.backgroundRowEncoding.classList.add('hidden');
    this.allRows.classList.remove('hidden');
    this.tileMask.setAll(false);
  }
  done() {
    this.allRows.classList.add('away-right');
  }


  toByteFormat() {
    this.leftText.style.justifySelf = 'center';
    this.leftText.toByteFormat();
    this.rightText.style.justifySelf = 'center';
    this.rightText.toByteFormat();
  }
  toGridFormat() {
    this.leftText.toGridFormat();
    this.leftText.style.justifySelf = '';
    this.rightText.toGridFormat();
    this.rightText.style.justifySelf = '';
  }
  hideZeros() {
    for (const r of this.allRows.children) {
      r.hideZeros();
    }
  }
}

customElements.define('tile-encoding', TileEncoding);