import { FadeControl } from "../fadecontrol.js";
import { ShowGrid } from "../showgrid.js";
import { TwoBitDrawing } from "../twobitdrawing.js";
import { TwoBitColourPicker } from "../twobitcolourpicker.js";
import { TwoBitCanvas } from "../twobitcanvas.js";
import { PalettePicker } from "../palettepicker.js";
import { PaletteSlider } from "../paletteslider.js";
import { PaletteToggle } from "../palettetoggle.js";
import { BigPaletteAnimation } from "../bigpaletteanimation.js";
import { AnimationController, PresetAnimation } from "../../modules/animation_controller.js";
import { TextGridTile } from "./textgridtile.js";
import { TileMask } from "./tilemask.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: grid;
    align-items: center;
    height: 100%;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
  }
  #drawing-container {
    position: relative;
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  #big-drawing {
    position: absolute;
    height: 30%;
    aspect-ratio: 160/144;
    width: auto;
  }
  #big-drawing.hidden{
    visibility: hidden;
  }
  
  two-bit-drawing {
    width: 100%;
    transition: transform var(--animation-speed, 1s), width var(--animation-speed, 1s), height var(--animation-speed, 1s);
  }
  text-grid-tile {
    z-index: 3;
    font-size: 200%;
    position:absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    transition: opacity var(--animation-speed, 1s);
  }
  text-grid-tile.hidden {
    opacity: 0;
  }
  tile-mask {
    z-index: 2;
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  #drawing.move-side {
    width: 90%;
    transform: translateX(-111%);
  }
  #big-drawing.grow {
    height: 50%;
  }
  #big-drawing.grow-full {
    height: 100%;
  }
  #drawing.go-away {
    width: 90%;
    transform: translateX(-250%);
  }
  #colour-control.hidden {
    opacity: 0;
  }
  #colour-control.go-away {
    transition: transform var(--animation-speed, 1s);
    transform: translateX(100%);
  }

  two-bit-colour-picker {
    grid-column: 2 / 6;
    margin-top: 3%;
    width: 100%;
  }
  #palette-controls {
    grid-column: 1;
    grid-row: 1;
    justify-self: end;
    margin-right: 6%;
    font-weight: bold;
    width: 65%;
    font-size: 2em;
  }
  #colour-control {
    grid-column: 3;
    grid-row: 1;
    margin-left: 3%;
    width: 120%;
    position: relative;
  }
  #individual-colour-blocker {
    width: 100%;
    height: 100%;
    position: absolute;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    margin-bottom: 5%;
    pointer-events: none;
  }
  #individual-colour-blocker div {
    background-color: grey;
    transition: opacity var(--animation-speed, 1s);
    opacity: 0;
  }
  #cpicker-container {
    width: 65%;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    margin-bottom: 5%;
    position: relative;
  }
  #colour-blocker {
    z-index: 1;
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: gray;
    opacity: 100%;
  }
  #colour-blocker.move {
    animation: 1s colour-blocker-move;
    animation-fill-mode: forwards;
  }
  #colour-blocker.away {
    animation: 1s colour-blocker-away;
    animation-fill-mode: forwards;
  }
  @keyframes colour-blocker-move {
    from {
      top: 0%;
    }
    to {
      top: 35%;
    }
  }

  @keyframes colour-blocker-away {
    from {
      top: 35%;
    }
    to {
      top: 100%;
    }
  }
  #container-container {
    display: flex;
    align-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    flex-direction: column;
    justify-content: center;
  }
</style>
<div id="container-container">
<two-bit-drawing id="big-drawing" class="hidden" width="160" height="144"></two-bit-drawing>
<div id="container">
  <div id="drawing-container">
    <tile-mask></tile-mask>
    <text-grid-tile class="hidden"></text-grid-tile>
    <two-bit-drawing id="drawing" colour-picker-id="colour-picker" width="8" height="8"></two-bit-drawing>
    <show-grid hidden ></show-grid>
  </div>
  <div id="colour-control" hidden class="hidden">
    <div id="colour-blocker"></div>
    <div id="cpicker-container">
      <div id="individual-colour-blocker">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <two-bit-colour-picker  id="colour-picker" style="opacity: 0;"></two-bit-colour-picker>
    </div>
    <div id="palette-controls" style="opacity: 0;">
      <palette-picker></palette-picker>
    </div>
  </div>
</div>
</div>
`;

const k4ColourAlternating = new Uint8Array([0, 1, 2, 3, 0, 1, 2, 3, 1, 2, 3, 0, 1, 2, 3, 0, 2, 3, 0, 1, 2, 3, 0, 1, 3, 0, 1, 2, 3, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3, 1, 2, 3, 0, 1, 2, 3, 0, 2, 3, 0, 1, 2, 3, 0, 1, 3, 0, 1, 2, 3, 0, 1, 2]);
const k4ColourTile = new Uint8Array([0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3]);
const kPlayerCharacter = new Uint8Array([0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 2, 2, 2, 0, 2, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 3, 3, 0, 3, 3, 0, 0,]);
const kPlayerDamage = new Uint8Array([0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 0, 1, 3, 1, 0, 2, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 3, 3, 0, 0, 0, 3, 3, 0]);
const kDoubleFace = new Uint8Array([0, 3, 3, 3, 3, 3, 3, 0, 3, 0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 0, 0, 3, 0, 3, 3, 0, 1, 0, 0, 1, 0, 3, 3, 0, 0, 2, 2, 0, 0, 3, 3, 0, 1, 3, 3, 1, 0, 3, 3, 0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 3, 3, 3, 0]);
const kWater = new Uint8Array([0, 1, 2, 3, 0, 1, 2, 3, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3]);

class TileFadeDemo extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.drawing = shadow.getElementById('drawing');
    this.bigDrawing = shadow.getElementById('big-drawing');
    this.palette = shadow.querySelector('palette-picker');
  }

  connectedCallback() {
    const colourPicker = this.shadowRoot.getElementById('colour-picker');
    this.colourPicker = colourPicker;
    this.mask = this.shadowRoot.querySelector('tile-mask');
    this.textTile = this.shadowRoot.querySelector('text-grid-tile');
    this.shadowRoot.querySelector('show-grid').drawing = this.drawing;
    const paletteSetter = (colours) => {
      this.drawing.twoBitCanvas.colours = colours;
      this.drawing.twoBitCanvas.redrawCanvas();
      this.bigDrawing.twoBitCanvas.colours = colours;
      this.bigDrawing.twoBitCanvas.redrawCanvas();
      colourPicker.setPalette(colours);
    };
    //this.shadowRoot.querySelector('fade-control').fadeCallback = paletteSetter;
    /*this.shadowRoot.querySelector('palette-picker')
      .addEventListener('palette-change', (ev) => {
        paletteSetter(ev.detail);
      });
    this.shadowRoot.querySelector('palette-slider')
      .addEventListener('palette-change', (ev) => {
        paletteSetter(ev.detail);
      });*/
    this.shadowRoot.getElementById('palette-controls')
      .addEventListener('palette-change', (ev) => {
        paletteSetter(ev.detail);
      });
    const textGridTile = this.shadowRoot.querySelector('text-grid-tile');
    this.drawing.addEventListener('needRedraw', () => {
      textGridTile.setPixelData(this.drawing.twoBitCanvas.twoBitData);
    });
    const readyEvent = new CustomEvent('ready', {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(readyEvent);
  }

  showGrid() {
    this.drawing.setAttribute('show-pixel-grid', '');
  }
  hideGrid() {
    this.drawing.removeAttribute('show-pixel-grid');
  }

  showColourNumbers() {
    this.shadowRoot.getElementById('colour-control').hidden = false;
    this.shadowRoot.getElementById('colour-control').classList.remove('hidden');
    this.shadowRoot.querySelector('two-bit-colour-picker').style.opacity = '100%';
    this.shadowRoot.querySelector('two-bit-colour-picker').showNumbers();
  }

  showColours() {
    this.shadowRoot.querySelector('two-bit-colour-picker').style.opacity = '100%';
    const colourBlocker = this.shadowRoot.getElementById('colour-blocker');
    colourBlocker.className = 'move';
    /*const animationEnd = () => {
      const palette = this.shadowRoot.querySelector('palette-picker');
      new PresetAnimation(5, [
        () => palette.setPalette([0, 1, 0, 0]),
        () => palette.setPalette([0, 1, 2, 0]),
        () => palette.setPalette([0, 1, 2, 3]),
      ]).start();
      colourBlocker.removeEventListener('animationend', animationEnd);
    };
    colourBlocker.addEventListener(
      'animationend', animationEnd
    );*/
  }
  showOnlyPickerColours(values) {
    if (!(values instanceof Set)) values = new Set(values);
    for (let i = 0; i < 4; ++i) {
      if (values.has(i)) {
        this.showPickerColour(i);
      } else {
        this.hidePickerColour(i);
      }
    }
  }
  showAllPickerColours() {
    this.showOnlyPickerColours([0, 1, 2, 3]);
  }
  showPickerColour(c) {
    // +2 is because +1 of nth child and because there's an extra div at the start.
    const blocker = this.shadowRoot.querySelector(`#individual-colour-blocker :nth-child(${c+2})`);
    blocker.style = 'opacity: 0';
  }
  hidePickerColour(c) {
    const blocker = this.shadowRoot.querySelector(`#individual-colour-blocker :nth-child(${c+2})`);
    blocker.style = 'opacity: 1';
  }

  hideColourNumbers() {
    this.shadowRoot.querySelector('two-bit-colour-picker').hideNumbers();
  }

  emphasizePixelNumber(index) {
    this.shadowRoot.querySelector('text-grid-tile').emphasizeOnePixelByIndex(index);
  }
  emphasizePixelsPalette(index) {
    const value = this.drawing.tileMap.tileSet.tileBytes[index];
    const picker = this.shadowRoot.querySelector('two-bit-colour-picker');
    this.showOnlyPickerColours([value]);
    picker.pickColour(value);
  }
  revealPixel(index) {
    this.shadowRoot.querySelector('tile-mask').setPixelByIndex(index, false);
  }

  showPixelColour(index, fps = 1) {
    const value = this.drawing.tileMap.tileSet.tileBytes[index];
    return new PresetAnimation(fps, [
      //() => this.textTile.emphasizeOnePixelByIndex(index),
      /*() => {
        for (let i = 0; i < 4; ++i) {
          if (i === value) {
            this.showPickerColour(i);
          } else {
            this.hidePickerColour(i);
          }
        }
        this.colourPicker.pickColour(value);
      },*/
      () => {
        this.textTile.emphasizeOnePixelByIndex(index);
        this.mask.setPixelByIndex(index, false);
      }
      /*() => {
        for (let i = 0; i < 4; ++i) {
            this.showPickerColour(i);
        }
      },*/
    ]).start();
  }

  async showRestPixelColours(startIndex, fps = 1, fpsChangeFn = null) {
    fpsChangeFn ??= (x) => x;
    for (let i = startIndex; i < 64; ++i) {
      await this.showPixelColour(i, fps);
      fps = fpsChangeFn(fps);
    }
  }

  showOnlyPixelsWithValues(values) {
    if (!(values instanceof Set)) values = new Set(values);
    const mask = this.shadowRoot.querySelector('tile-mask');
    for (let i = 0; i < 64; ++i) {
      const value = this.drawing.tileMap.tileSet.tileBytes[i];
      mask.setPixelByIndex(i, !values.has(value));
    }
  }
  showAllPixels() {
    this.shadowRoot.querySelector('tile-mask').unmaskAll();
  }

  unsetColour() {
    this.shadowRoot.querySelector('two-bit-colour-picker').unsetColour();
  }

  hideTextTile() {
    this.shadowRoot.querySelector('text-grid-tile').className = 'hidden';
  }

  showPalette() {
    this.shadowRoot.getElementById('palette-controls').style.opacity = '100%';
    this.shadowRoot.getElementById('colour-blocker').className = 'away';
  }

  paletteAnimation(fps, palettes) {
    const callbacks = palettes.map((p) => () => this.setPalette(p));
    return new PresetAnimation(fps, callbacks).start();
  }

  cycleColours() {
    new PresetAnimation(5, [
      /*() => this.setPalette([1, 2, 3, 0]),
      () => this.setPalette([2, 3, 0, 1]),
      () => this.setPalette([3, 0, 1, 2]),
      () => this.setPalette([0, 1, 2, 3]),*/
      () => this.setPalette([1, 2, 3, 2]),
      () => this.setPalette([2, 3, 2, 1]),
      () => this.setPalette([3, 2, 1, 0]),
      () => this.setPalette([2, 1, 0, 1]),
      () => this.setPalette([1, 0, 1, 2]),
      () => this.setPalette([0, 1, 2, 3]),
    ]).start();
  }
  cycleColours2() {
    return this.paletteAnimation(5, [
      [1, 0, 0, 0],
      [1, 2, 0, 0],
      [1, 2, 3, 0],
      [0, 1, 2, 3],
      [3, 0, 1, 2],
      [2, 3, 0, 1],
      [1, 2, 3, 0],
      [0, 1, 2, 3],
      [2, 0, 0, 1],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ]);
  }

  setPalette(p) {
    this.palette.setPalette(p);
  }

  draw4Colours() {
    this.setTile(k4ColourTile);
  }
  draw4AlternatingColours() {
    this.setTile(k4ColourAlternating);
  }

  setTile(tbpp) {
    this.drawing.tileMap.tileSet.setTile(0, tbpp);
    this.drawing.updateTile(0);
    this.drawing.needRedraw = true;
    this.bigDrawing.tileMap.tileSet.setTile(0, tbpp);
    this.bigDrawing.updateTile(0);
    this.bigDrawing.needRedraw = true;
    //this.drawing.twoBitCanvas.setTwoBitData(tbpp);
  }

  drawPlayerCharacter() {
    this.setTile(kPlayerCharacter);
  }

  switchToTextTile() {
    this.shadowRoot.querySelector('text-grid-tile').className = '';
    this.shadowRoot.querySelector('tile-mask').maskAll();
  }

  fadeOut() {
    return new Promise((resolve) => {
      const palette = this.shadowRoot.querySelector('palette-picker');
      new PresetAnimation(5, [
        () => palette.setPalette([0, 1, 2, 3]),
        () => palette.setPalette([0, 0, 1, 2]),
        () => palette.setPalette([0, 0, 0, 1]),
        () => palette.setPalette([0, 0, 0, 0]),
        () => resolve(),
      ]).start();
    });
  }
  fadeBlack() {
    return this.paletteAnimation(5, [
      [0, 1, 2, 3],
      [1, 2, 3, 3],
      [2, 3, 3, 3],
      [3, 3, 3, 3],
    ]);
  }
  fadeIn() {
    return new Promise((resolve) => {
      const palette = this.shadowRoot.querySelector('palette-picker');
      new PresetAnimation(5, [
        () => palette.setPalette([0, 0, 0, 0]),
        () => palette.setPalette([0, 0, 0, 1]),
        () => palette.setPalette([0, 0, 1, 2]),
        () => palette.setPalette([0, 1, 2, 3]),
        () => resolve(),
      ]).start();
    });
  }
  fadeInFromBlack() {
    return this.paletteAnimation(5, [
      [0, 1, 2, 3],
      [1, 2, 3, 3],
      [2, 3, 3, 3],
      [3, 3, 3, 3],
    ].reverse());
  }

  flash() {
    return new Promise((resolve) => {
      const palette = this.shadowRoot.querySelector('palette-picker');
      new PresetAnimation(7, [
        () => palette.setPalette([0, 2, 3, 1]),
        () => palette.setPalette([0, 1, 2, 3]),
        () => palette.setPalette([0, 2, 3, 1]),
        () => palette.setPalette([0, 1, 2, 3]),
        () => palette.setPalette([0, 2, 3, 1]),
        () => palette.setPalette([0, 1, 2, 3]),
        () => palette.setPalette([0, 2, 3, 1]),
        () => palette.setPalette([0, 1, 2, 3]),
        resolve,
      ]).start();
    });
  }

  drawPlayerDamage() {
    this.setTile(kPlayerDamage);
  }

  drawDoubleFace() {
    this.setTile(kDoubleFace);
  }

  image1Palette() {
    this.setPalette([0, 3, 0, 3]);
  }

  image2Palette() {
    this.setPalette([0, 0, 3, 3]);
  }

  toggleFacePixels() {
    return new PresetAnimation(5, [
      () => this.showOnlyPixelsWithValues([1, 3]),
      () => this.showOnlyPixelsWithValues([2, 3]),
      () => this.showOnlyPixelsWithValues([1, 3]),
      () => this.showOnlyPixelsWithValues([2, 3]),
      () => this.showOnlyPixelsWithValues([1, 3]),
      () => this.showOnlyPixelsWithValues([2, 3]),
    ]);
  }

  toggleImages() {
    new PresetAnimation(5, [
      () => this.image1Palette(),
      () => this.image2Palette(),
      () => this.image1Palette(),
      () => this.image2Palette(),
      () => this.image1Palette(),
      () => this.image2Palette(),
      () => this.image1Palette(),
      () => this.image2Palette(),
      () => this.image1Palette(),
      () => this.image2Palette(),
    ]).start();
  }

  drawWater() {
    this.setTile(kWater);
  }

  emphasizeWaterStep(step) {
    this.showOnlyPixelsWithValues([step]);
    this.showOnlyPickerColours([step]);
    this.showOnlyPixelsWithValues([step]);
  }
  showWaterSteps() {
    return new PresetAnimation(5, [
      () => this.emphasizeWaterStep(0),
      () => this.emphasizeWaterStep(1),
      () => this.emphasizeWaterStep(2),
      () => this.emphasizeWaterStep(3),
    ]).start();
  }
  emphasizeWaterWhite() {
    this.showOnlyPixelsWithValues([1,2,3]);
    this.showOnlyPickerColours([1,2,3]);
    return this.paletteAnimation(5, [
      [0, 0, 1, 2],
      [0, 0, 0, 1],
      [0, 0, 0, 0],
    ]);
  }
  emphasizeWaterNotWhite() {
    this.showOnlyPixelsWithValues([0]);
    this.showOnlyPickerColours([0]);
    return this.paletteAnimation(5, [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
    ]);
  }

  getWaterAnimator() {
    const waterPalettes = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    let f = 0;
    const animation = new AnimationController(3, () => {
      this.setPalette(waterPalettes[f]);
      f = (f + 1) % waterPalettes.length;
    });
    return animation;
  }

  showBigWater() {
    this.drawing.className = 'move-side';
    this.bigDrawing.className = 'grow';
  }
  showBiggestWater() {
    this.bigDrawing.className = 'grow-full';
    this.drawing.className = 'go-away';
    this.shadowRoot.getElementById('colour-control').className = 'go-away';
  }
}

customElements.define('tile-palette-pick', TileFadeDemo);