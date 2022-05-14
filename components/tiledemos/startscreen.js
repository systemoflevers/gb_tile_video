import { TwoBitDrawing } from "../twobitdrawing.js";
import { PalettePicker } from "../palettepicker.js";
import { AnimationController, PresetAnimation } from "../../modules/animation_controller.js";
import { kGreenColours, expandPalette } from "../../modules/colours.js";

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow-y: clip;
  }

  two-bit-drawing {
    height: 100%;
    aspect-ratio: 160 / 144;
    position:absolute;
  }

  #off-screen {
    background-color: rgb(240 248 208); /*#dbffa4;*/ /*#f0ffd8*/
    height: 100%;
    aspect-ratio: 160 / 144;
    z-index: 2;
    mix-blend-mode: color;
  }
  #off-screen.invis {
    opacity: 0;
  }
</style>
<div id="container">
  <div id="off-screen" class="invis"></div>
  <two-bit-drawing id="static-drawing" width="160" height="144"></two-bit-drawing>
</div>
`;

const kStartScreen = `{
  "map":"AAECAwEEBQYHCAEJAQoLAQwNDg8QERITFBUWFxgZGhsZHB0eHyAhIiMkJSYnFSgpFSorLCotLi8wMTIiMzQ1Njc4OTc6Ozw9ND4/NEBBQkNEREREREREREREREREREREREREREREREVGR0hJSktMTU5PUFFSREREREREU1RVVldYWVpbXF1eX2BERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERhYmNkZWZERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERGdoaWprbG1uREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREb3BxcnN0dXZ3eERERERE",
  "tiles":"/wD/AP8A/wD/AP8A/wD4AP8A/wD/AP8AAAAAAAAAAAD/AP8A/wD/AAEAAQABAAEA/wD/AP8A/wD4APgA+ADAAP8A/wD/AP8AfgB+AH4AAA7/AP8A/wD/AAcABwAHAAcA/wD/AP8A/wD8APwA/ADgHP8A/wD/AP8ADwAPAA8ADgD/AP8A/wD/AMAAwADAAAAA/wD/AP8A/wB+AH4AfgBwDv8A/wD/AP8AAwADAAMAAAD/AP8A/wD/AP4A/gD+AHAA/wD/AP8A/wAfAB8AHwAAA/8A/wD/AP8AgQCBAIEAAYD/AP8A/wD/APgA+AD4AMA4/wD/AP8A/wAfAB8AHwAfAPgA+ADAOMA4wDjAOMA4wDgAAAAAAB8AHwAfHAAcABwAAQABAA7xDvEO8QABAAEAAcAAwAAAwADAAMAAwADAAMAAAAAAAPwA/AD8AAAAAAAAAA4ADgAOAA4ADgAOAA4ADgcABwAAAAAAAAAAAAAAAADgHOAc4ADgAOAAAAAAAAAADgAOAAAOAA4ADgAOAA4ADgAAAAAABwAHAAcAAAAAAAAAAAAAA/wD/AP8AAAAAAAAcA5wDvAO8A7wDnAOcA5wDgAAAAAA4ADgAOADAAMAAwBwAHAAAHAAcABwgHCAcIBwAAAAAAA/AD8APzgHOAc4BwADAAMAAwADAAMAAwADAAMBgAGAAYABgAGAAIAAgACAwDjAOMA4wDjAOAAAAAAAAB8AHwAfAB8AHwAfAB8AHwDAOMA4wDjAOMA4wDjAOMA4ABwAHAAcAB8AHwAfAAAAAAABAAEAAQCBAIEAgQABAAEAwADAAMAAwADAAMAAwADAAAAAAAAAAPwA/AD84BzgHAAHAAcABwAHAAcABwcABwAAHAAcABzgHOAc4BzgHOAcAAAAAAAAAAcABwAHAAAAAAAAAAAAAAP8A/wD/AAAAABwDnAOcA7wDvAO8A5wDnAOAwADAAMAAOAA4ADgAAAAAIBwgHCAcABwAHAAcABwAHA4BzgHOAc4BzgHOAcAAAAAAAMAAwADAwADAAMAAwADAADwAPAA8IB/gH+Af4AAgAAAAAAAAAAA+AD4APgAAAAAwDjAP8A/wD/4B/gH+Af/AAAAAAAAAAAAAP8A/wD//wAAAQABAAEAAQ7xDvEO8f8AAMAAwADAAMAH+Af4B/j/AOAc4BzgHOAc4B/gH+Af/wAADgAOAA4ADnCPcI9wj/8ABwAHAAcABwA/wD/AP8D/AAAOAA8ADwAPfoF+gX6B/wAAAADAAMAAwAD/AP8A//8AAAAAAAAAAAAD/AP8A/z/AHAOcA5wDnAO8A/wD/AP/wAAAAMAAwADAB/gH+Af4P8AAHCAfoB+gH7wD/AP8A//AAMAHAMcAxwD/AP8A/wD/wCAAACAAIAAgAD/AP8A//8AAAAAAAAAAAAH+Af4B/j/AB8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A4ADgAIAAgACHAIcAhgCGAAYABgAGAAYA/gD+AAYABgAAAAAAAAAAAB4AHgAAAAAAfgB+ABgAGAAYABgAGAAYAAEAAQAAAAAAeAB4AAAAAADgAOAAYABgAGEAYQBgAGAABwAHAAEAAQDhAOEAAQABAIcAhwCHAIcAhwCHAIAAgACGAIYAhgCGAIcAhwAHAAcAAAAAAAAAAADhAOEA4QDhAB4AHgAYABgA+AD4APgA+AAAAAAAAAAAAH8AfwB/AH8AeAB4AGAAYADhAOEA4ADgAAEAAQABAAEA/wD/AAcABwCGAIYAhwCHAIAAgADgAOAABgAGAIYAhgAGAAYABgAGAAAAAAAYABgAHgAeAB4AHgB4AHgAGAAYABgAGAAYABgAAAAAAHgAeAB4AHgAeAB4AGAAYABhAGEAYQBhAGEAYQAHAAcA/wD/AP8A/wD/AP8AgACAAIcAhwCHAIcAhwCHAAcABwCHAIcAhgCGAIYAhgDhAOEA4QDhAAAAAAAAAAAA+AD4APgA+AAYABgAHgAeAH8AfwB/AH8AAAAAAAAAAAD4APgA/wD/AGAAYABgAGAAAQABAOEA4QABAAEABwAHAP8A/wD+Af4B/gH/AP4B/gGEewT7f4AH+Af45xgP8B/gDvEM8znGOMc4xznGOcY5xhDvEO+TbBDvEO+TbJNsk2wg3yDfOcZ5hjnGOcY5xjnGf4B/gP8A/wD/AP8A/wD/APgH+Af5BvgH+Af5BvkG+QYc4xjnk2wwz3CP8wzzDPMMOMcwzyfYIN8g3z7BIN8h3nCPYJ/PMEC/QL98g8E+wzzhHsE+j3CfYJ9gn2CBfoF+gX4A/zzDPMM8wzzDAP+Bfod4g3yRbplmmWaZZoF+gX7DPIN8P8AH+Af4P8AD/AP8/wDwD/cI8A/+AfAP/wD/AP8AtEu1SoR79wiEe/8A/wD/ACDf+wQ7xLtEO8T/AP8A/wCEe71ChXq9QoV6/wD/AP8AGOdbpFukW6RYp/8A/wD/AEO8X6BDvF+gX6D/AP8A/wB4h3uEeId7hAj3/wD/AP8AWqXaJVql2iVGuf8A/wD/ABDv9gkR7vYJFun/AP8A/wCHeL9Ah3j3CId4/wD/AA=="
  }`;

const kWithArrow = `{
  "map":"AAECAwEEBQYHCAEJAQoLAQwNDg8QERITFBUWFxgZGhsZHB0eHyAhIiMkJSYnFSgpFSorLCotLi8wMTIiMzQ1Njc4OTc6Ozw9ND4/NEBBQkNEREREREREREREREREREREREREREREREVGR0hJSktMTU5PUFFSREREREREU1RVVldYWVpbXF1eX2BERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERhYmNkZWZEREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREeWdoaWprbG1uREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREb3BxcnN0dXZ3eERERERE",
  "tiles":"/wD/AP8A/wD/AP8A/wD4AP8A/wD/AP8AAAAAAAAAAAD/AP8A/wD/AAEAAQABAAEA/wD/AP8A/wD4APgA+ADAAP8A/wD/AP8AfgB+AH4AAA7/AP8A/wD/AAcABwAHAAcA/wD/AP8A/wD8APwA/ADgHP8A/wD/AP8ADwAPAA8ADgD/AP8A/wD/AMAAwADAAAAA/wD/AP8A/wB+AH4AfgBwDv8A/wD/AP8AAwADAAMAAAD/AP8A/wD/AP4A/gD+AHAA/wD/AP8A/wAfAB8AHwAAA/8A/wD/AP8AgQCBAIEAAYD/AP8A/wD/APgA+AD4AMA4/wD/AP8A/wAfAB8AHwAfAPgA+ADAOMA4wDjAOMA4wDgAAAAAAB8AHwAfHAAcABwAAQABAA7xDvEO8QABAAEAAcAAwAAAwADAAMAAwADAAMAAAAAAAPwA/AD8AAAAAAAAAA4ADgAOAA4ADgAOAA4ADgcABwAAAAAAAAAAAAAAAADgHOAc4ADgAOAAAAAAAAAADgAOAAAOAA4ADgAOAA4ADgAAAAAABwAHAAcAAAAAAAAAAAAAA/wD/AP8AAAAAAAAcA5wDvAO8A7wDnAOcA5wDgAAAAAA4ADgAOADAAMAAwBwAHAAAHAAcABwgHCAcIBwAAAAAAA/AD8APzgHOAc4BwADAAMAAwADAAMAAwADAAMBgAGAAYABgAGAAIAAgACAwDjAOMA4wDjAOAAAAAAAAB8AHwAfAB8AHwAfAB8AHwDAOMA4wDjAOMA4wDjAOMA4ABwAHAAcAB8AHwAfAAAAAAABAAEAAQCBAIEAgQABAAEAwADAAMAAwADAAMAAwADAAAAAAAAAAPwA/AD84BzgHAAHAAcABwAHAAcABwcABwAAHAAcABzgHOAc4BzgHOAcAAAAAAAAAAcABwAHAAAAAAAAAAAAAAP8A/wD/AAAAABwDnAOcA7wDvAO8A5wDnAOAwADAAMAAOAA4ADgAAAAAIBwgHCAcABwAHAAcABwAHA4BzgHOAc4BzgHOAcAAAAAAAMAAwADAwADAAMAAwADAADwAPAA8IB/gH+Af4AAgAAAAAAAAAAA+AD4APgAAAAAwDjAP8A/wD/4B/gH+Af/AAAAAAAAAAAAAP8A/wD//wAAAQABAAEAAQ7xDvEO8f8AAMAAwADAAMAH+Af4B/j/AOAc4BzgHOAc4B/gH+Af/wAADgAOAA4ADnCPcI9wj/8ABwAHAAcABwA/wD/AP8D/AAAOAA8ADwAPfoF+gX6B/wAAAADAAMAAwAD/AP8A//8AAAAAAAAAAAAD/AP8A/z/AHAOcA5wDnAO8A/wD/AP/wAAAAMAAwADAB/gH+Af4P8AAHCAfoB+gH7wD/AP8A//AAMAHAMcAxwD/AP8A/wD/wCAAACAAIAAgAD/AP8A//8AAAAAAAAAAAAH+Af4B/j/AB8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A4ADgAIAAgACHAIcAhgCGAAYABgAGAAYA/gD+AAYABgAAAAAAAAAAAB4AHgAAAAAAfgB+ABgAGAAYABgAGAAYAAEAAQAAAAAAeAB4AAAAAADgAOAAYABgAGEAYQBgAGAABwAHAAEAAQDhAOEAAQABAIcAhwCHAIcAhwCHAIAAgACGAIYAhgCGAIcAhwAHAAcAAAAAAAAAAADhAOEA4QDhAB4AHgAYABgA+AD4APgA+AAAAAAAAAAAAH8AfwB/AH8AeAB4AGAAYADhAOEA4ADgAAEAAQABAAEA/wD/AAcABwCGAIYAhwCHAIAAgADgAOAABgAGAIYAhgAGAAYABgAGAAAAAAAYABgAHgAeAB4AHgB4AHgAGAAYABgAGAAYABgAAAAAAHgAeAB4AHgAeAB4AGAAYABhAGEAYQBhAGEAYQAHAAcA/wD/AP8A/wD/AP8AgACAAIcAhwCHAIcAhwCHAAcABwCHAIcAhgCGAIYAhgDhAOEA4QDhAAAAAAAAAAAA+AD4APgA+AAYABgAHgAeAH8AfwB/AH8AAAAAAAAAAAD4APgA/wD/AGAAYABgAGAAAQABAOEA4QABAAEABwAHAP8A/wD+Af4B/gH/AP4B/gGEewT7f4AH+Af45xgP8B/gDvEM8znGOMc4xznGOcY5xhDvEO+TbBDvEO+TbJNsk2wg3yDfOcZ5hjnGOcY5xjnGf4B/gP8A/wD/AP8A/wD/APgH+Af5BvgH+Af5BvkG+QYc4xjnk2wwz3CP8wzzDPMMOMcwzyfYIN8g3z7BIN8h3nCPYJ/PMEC/QL98g8E+wzzhHsE+j3CfYJ9gn2CBfoF+gX4A/zzDPMM8wzzDAP+Bfod4g3yRbplmmWaZZoF+gX7DPIN8P8AH+Af4P8AD/AP8/wDwD/cI8A/+AfAP/wD/AP8AtEu1SoR79wiEe/8A/wD/ACDf+wQ7xLtEO8T/AP8A/wCEe71ChXq9QoV6/wD/AP8AGOdbpFukW6RYp/8A/wD/AEO8X6BDvF+gX6D/AP8A/wB4h3uEeId7hAj3/wD/AP8AWqXaJVql2iVGuf8A/wD/ABDv9gkR7vYJFun/AP8A/wCHeL9Ah3j3CId4/wD/AP8Y/xz/Hv8f/x7/HP8Y/wA="
  }`;
const kBlankTileIndex = 68;
const kArrowTileIndex = 121;
const kStartPosition = {x: 5*8, y: 11*8};
const kPassPosition = {x: 5*8, y: 14*8};
const kPositions = [kStartPosition, kPassPosition];
/*function themeLooper() {
  const buffer = 2.20
  if (this.currentTime > this.duration - buffer) {
    this.currentTime = 0;
    this.play();
  }
}*/

const kSelection = new Map([
  [0, 'start'],
  [1, 'passcode'],
]);

export class StartScreen extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.drawing = this.shadowRoot.getElementById('static-drawing');
    this.themeMusic = [new Audio('theme.mp3'), new Audio('theme.mp3')];
    this.intervalId = null;

    this.selectSound = new Audio('select_sound.mp3');
    this.delay = 0;

    this.selected = 1;
  }

  connectedCallback() {
    document.addEventListener('keydown', (ev) => {
      switch (ev.code) {
        case 'ArrowUp':
          this.upButton();
          return;
        case 'ArrowDown':
          this.downButton();
          return
        case 'KeyA':
        case 'Enter':
          this.aButton();
          return;
      }
    });
  }

  async show() {
    const offScreen = this.shadowRoot.getElementById('off-screen');
    offScreen.className = '';
    await new Promise((res, rej) => setTimeout(() => res(), 100));
    offScreen.className = 'invis';
    
    this.drawing.fromB64JSONGBData(kWithArrow);//kStartScreen);
    let i = 1;
    this.themeMusic[0].currentTime = 0;
    this.themeMusic[0].play();
    this.intervalId = setInterval(() => {
      this.themeMusic[i].play();
      i = (i + 1) % 2;
      this.themeMusic[i].pause();
      this.themeMusic[i].currentTime = 0;
    }, this.themeMusic[0].duration * (1000 + this.delay));
    const selectionPromise =
      new Promise((res, rej) => this.selectionResolver = res);
    return selectionPromise;
  }

  stopMusic() {
    this.themeMusic[0].pause();
    this.themeMusic[1].pause();
    clearInterval(this.intervalId);
  }

  blankSelected() {
    this.drawing.selectedTile = kBlankTileIndex;
    this.drawing.placeTile(
      kPositions[this.selected].x, kPositions[this.selected].y);
  }
  arrowSelected() {
    this.drawing.selectedTile = kArrowTileIndex;
    this.drawing.placeTile(
      kPositions[this.selected].x, kPositions[this.selected].y);
  }
  upButton() {
    this.blankSelected()
    this.selected = Math.max(this.selected - 1, 0);
    this.arrowSelected();
  }
  downButton() {
    this.blankSelected()
    this.selected = Math.min(this.selected + 1, kPositions.length - 1);
    this.arrowSelected();
  }
  aButton() {
    this.selectSound.play();
    this.stopMusic();
    const selection = kSelection.get(this.selection);
    const fadePromise = this.fadeToBlack();
    this.selectionResolver?.call(null, {selection, fadePromise});
    return {selection, fadePromise};
  }

  setPalette(palette) {
    this.drawing.twoBitCanvas.colours = expandPalette(palette, kGreenColours);
    this.drawing.twoBitCanvas.redrawCanvas();
  }

  fadeToBlack() {
    return new PresetAnimation(5, [
      () => this.setPalette([0, 1, 2, 3]),
      () => this.setPalette([1, 2, 3, 3]),
      () => this.setPalette([2, 3, 3, 3]),
      () => this.setPalette([3, 3, 3, 3]),
    ]).start();
  }

}
customElements.define('start-screen', StartScreen);