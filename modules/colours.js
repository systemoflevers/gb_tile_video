
const kColourChangeEventType = 'colour-change';
function colourChangeEvent(colourID) {
  return new CustomEvent(kColourChangeEventType,
    {
      bubbles: true,
      composed: true,
      detail: colourID,
    });
}

const kPaletteChangeEventType = 'palette-change';
function paletteChangeEvent(colours) {
  return new CustomEvent(kPaletteChangeEventType,
    {
      bubbles: true,
      composed: true,
      detail: colours,
    }
  );
}

function expandPalette(palette, colourPalette) {
  const colours = []
  for (let i = 0; i < 4; ++i) {
    colours.push(colourPalette[palette[i]]);
  }
  return colours;
}

const kGreenColours = [
  [224, 248, 208],
  [136, 192, 112],
  [52, 104, 86],
  [8, 24, 32],
];

export {
  kColourChangeEventType,
  colourChangeEvent,
  kPaletteChangeEventType,
  paletteChangeEvent,
  expandPalette,
  kGreenColours,
}