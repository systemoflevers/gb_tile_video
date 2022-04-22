
const kPaletteChangeEventType = 'palette-change';
function paletteChangeEvent(colours) {
  return new CustomEvent(kPaletteChangeEventType,
    {
      bubbles: true,
      detail: colours,
    }
  );
}

export {
  kPaletteChangeEventType,
  paletteChangeEvent,
}