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
  }

  connectedCallback() {
    const showGridCheckbox = this.shadowRoot.getElementById('show-grid');
    showGridCheckbox.addEventListener('change', (ev) => {
      if (!this.drawing) return;
      if (showGridCheckbox.checked) {
        this.drawing.setAttribute('show-pixel-grid', '');
      } else {
        this.drawing.removeAttribute('show-pixel-grid');
      }
      console.log(showGridCheckbox.checked);
    });
  }
}

customElements.define('show-grid', ShowGrid);