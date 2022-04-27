const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
div {
  aspect-ratio: 16 / 9;
  max-width: 95%;
  max-height: 95%;
  margin: auto;
  border-style: solid;
  overflow: hidden;
  padding: 1%;
  box-sizing: border-box;
  position: relative;
}
</style>
<div>
  <slot></slot>
</div>
`;

export class DemoHolder extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
  }
}
customElements.define('demo-holder', DemoHolder);