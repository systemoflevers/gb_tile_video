const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<span><input id="show-grid" type="checkbox" 
/><label for="show-grid">show grid</label></span>
`;

export class ShowGrid extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));

    this.drawing = null;
    this.pixelGrid = true;
    this.tileGrid = false;
    this.checkbox = shadow.getElementById('show-grid');
  }

  connectedCallback() {
    const showGridCheckbox = this.shadowRoot.getElementById('show-grid');
    showGridCheckbox.addEventListener('change', (ev) => {
      if (!this.drawing) return;
      if (showGridCheckbox.checked) {
        if (this.pixelGrid) {
        this.drawing.setAttribute('show-pixel-grid', '');
        }
        if (this.tileGrid) {
          this.drawing.setAttribute('show-tile-grid', '');
        }
      } else {
        if (this.pixelGrid) {
        this.drawing.removeAttribute('show-pixel-grid');
        }
        if (this.tileGrid) {
          this.drawing.removeAttribute('show-tile-grid');
        }
      }
      console.log(showGridCheckbox.checked);
    });
  }

  sendState(show) {
    if (!this.drawing) return;
    if (show) {
      if (this.pixelGrid) {
      this.drawing.setAttribute('show-pixel-grid', '');
      }
      if (this.tileGrid) {
        this.drawing.setAttribute('show-tile-grid', '');
      }
    } else {
      if (this.pixelGrid) {
      this.drawing.removeAttribute('show-pixel-grid');
      }
      if (this.tileGrid) {
        this.drawing.removeAttribute('show-tile-grid');
      }
    }
  }

  static get observedAttributes() { return ['tile', 'pixel']; }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.pixelGrid = this.hasAttribute('pixel');
    this.tileGrid = this.hasAttribute('tile');
    this.sendState(this.checkbox.checked);
  }
}

customElements.define('show-grid', ShowGrid);