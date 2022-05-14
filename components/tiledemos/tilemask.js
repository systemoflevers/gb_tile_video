const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  #container {
    display: grid;
    width: 100%;
    height: 100%;
    grid-template-columns: repeat(8, 1fr);
    justify-items: center;
    align-items: center;
  }
  #container div {
    width: 100%;
    height: 100%;
    background-color: var(--mask-background-colour, grey);
    transform: scale(1.05);
    /* using overlay because the scale causes a grid pattern where the pixels
       overlap. I'm not sure why that happens, but overlay seems to fix it...*/
    mix-blend-mode: overlay;
  }

  #container div.hidden {
    transform: scale(0);
  }

  .masked-shrink {
    animation: var(--animation-speed, 1s) mask-pixel forwards;
  }

  .unmasked-shrink {
    animation: var(--animation-speed, 1s) unmask-pixel forwards;
  }

  @keyframes mask-pixel {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1.1);
    }
  }

  @keyframes unmask-pixel {
    from {
      transform: scale(1.1);
    }
    to {
      transform: scale(0);
    }
  }

  .masked-fade {
    animation: var(--animation-speed, 1s) mask-pixel-fade forwards;
  }
  .unmasked-fade {
    animation: var(--animation-speed, 1s) unmask-pixel-fade forwards;
  }

  @keyframes mask-pixel-fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes unmask-pixel-fade {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
</style>
<div id=container>
    ${makePixels()}
</div>
`;

function makePixels() {
  const pixels = [];
  for (let i = 0; i < 64; ++i) {
    pixels.push('<div class="hidden"></div>');
  }
  return pixels.join('\n');
}

const kShrink = 0;
const kFade = 1;

export class TileMask extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.maskType = kFade;
  }

  getClass(mask) {
    if (mask) {
      return this.maskType === kShrink ? 'masked-shrink' : 'masked-fade';
    } else {
      return this.maskType === kShrink ? 'unmasked-shrink' : 'unmasked-fade';
    }
  }
  useFade() {
    this.maskType = kFade
  }
  useShrink() {
    this.maskType = kShrink;
  }

  setAll(mask) {
    const className = this.getClass(mask);
    const pixels = this.shadowRoot.querySelectorAll('#container div');
    for (const pixel of pixels) {
      pixel.className = className;
    }
  }

  maskAll() {
    this.setAll(true);
  }

  unmaskAll() {
    this.setAll(false);
  }

  setPixel(x, y, mask) {
    const pixelIndex = x + (8 * y);
    this.setPixelByIndex(pixelIndex, mask);
  }
  setPixelByIndex(index, mask) {
    const className = this.getClass(mask);
    const pixel = this.shadowRoot.querySelector(`#container :nth-child(${index + 1})`);
    pixel.className = className;
  }
}
customElements.define('tile-mask', TileMask);
