
const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: block;
}
#colour-picker {
  display: flex;
  align-items: flex-end;
}
#colour-picker > div {
  flex-grow: 1;
}
#colour-picker label div {
  width: 100%;
    aspect-ratio: 1;
    display: inline-block;
}

#colour-picker input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    display: none;
}

#colour-picker input:checked ~ label>div {
    margin-bottom: var(--select-lift, 30%); 
}
#swatch-0 {
    background-color: rgb(224, 248, 208);
}

#swatch-1 {
    background-color: rgb(136, 192, 112);
}

#swatch-2 {
    background-color: rgb(52, 104, 86);
}

#swatch-3{
    background-color: rgb(8, 24, 32);
}
</style>
  <div id="tool-picker">
  <span><input type="radio" name="tool" id="pencil" value="0" checked />
  <label for="pencil">pencil</label></span>
  <span><input type="radio" name="tool" id="tile-select" value="1" />
  <label for="tile-select">tile-select</label></span>
  <span><input type="radio" name="tool" id="tile-place" value="2" />
  <label for="tile-place">place tile</label></span>
</div>
`;

export class ToolPicker extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    const pickerDiv = this.shadow.getElementById('tool-picker');
    pickerDiv.addEventListener('change', this.colourChangeHandler.bind(this));
  }

  colourChangeHandler(ev) {
    const toolID = parseInt(ev.target.value);
    const toolChangeEvent = new CustomEvent('tool-change', {detail: toolID});
    this.dispatchEvent(toolChangeEvent);
  }
}

customElements.define('tool-picker', ToolPicker);