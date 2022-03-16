
const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: block;
  --select-lift: 30%;
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
    margin-bottom: var(--select-lift); 
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
<div id="colour-picker">
<div><input type="radio" name="colour" id="c0" value="0" /><label for="c0"><div id="swatch-0"></div></label></div>
<div><input type="radio" name="colour" id="c1" value="1" /><label for="c1"><div id="swatch-1"></div></label></div>
<div><input type="radio" name="colour" id="c2" value="2" /><label for="c2"><div id="swatch-2"></div></label></div>
<div><input type="radio" name="colour" id="c3" value="3" checked /><label for="c3"><div id="swatch-3"></div></label></div>
</div>
`;

export class TwoBitColourPicker extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.appendChild(template.content.cloneNode(true));
  }

  get targetID() {
    return this.getAttribute('target-id');
  }
  set targetID(value) {
    this.setAttribute('target-id', value);
  }

  connectedCallback() {
    const pickerDiv = this.shadow.getElementById('colour-picker');
    pickerDiv.addEventListener('change', this.colourChangeHandler.bind(this));
  }

  colourChangeHandler(ev) {
    const colourID = parseInt(ev.target.value);
    this.updateMatchingPickers(colourID);
    this.updateTargetDrawings(colourID);
  }

  updateTargetDrawings(colourID) {
    for (const targetID of this.targetID?.split(' ')) {
      const target = this.getRootNode().getElementById(targetID);
      if (target) {
        target.setColour(colourID);
      }
    }
    const colourChangeEvent = new CustomEvent('colour-change', {detail: colourID});
    this.dispatchEvent(colourChangeEvent);
  }

  updateMatchingPickers(colourID) {
    for (const targetID of this.targetID?.split(' ')) {
      // Tell other colour pickers that are for the same target to change.
      // Maybe this logic should be in the target?
      const allMatchingPickers =
          this.getRootNode().querySelectorAll(
            `two-bit-colour-picker[target-id~=${targetID}]`);
      for (const picker of allMatchingPickers) {
        if (picker === this) continue;
        picker.setColourChecked(colourID);
      }
    }
  }

  /**
   * Sets a colour as selected.
   * This will propagate the change to all target drawings and other matching
   * pickers if the |colourID| doesn't correspond to the currently selected
   * colour.
   */
  setColourChecked(colourID) {
    const colourInput = this.shadow.getElementById(`c${colourID}`);
    if (colourInput.checked) {
      // Assume everything is up to date and in sync.
      // This *hopefully* prevents infinite loops.
      return;
    }
    colourInput.checked = true;
    this.updateMatchingPickers(colourID);
    this.updateTargetDrawings(colourID);
  }
}

customElements.define('two-bit-colour-picker', TwoBitColourPicker);