//var tileDiv;

function doStuff() {
  const showButton = document.getElementById('show-tiles');
  showButton.addEventListener('click', (ev) => {
      showTiles();
      showButton.hidden = true;
  });
}

function showTiles() {
  const gbDrawing = document.querySelector('gb-draw');
  const tileDiv = document.getElementById('tiles');

  const drawing = gbDrawing.drawing;
  const tileData = drawing.getTiles(); 
  const numTiles = tileData.tiles.length;
  tiles = new Array(numTiles);
  for (let i = 0; i < numTiles; i++) {
      const tile = document.createElement('two-bit-canvas');
      tile.width = 8;
      tile.height = 8;
      tile.setTwoBitData(tileData.tiles[i]);

      tiles[i] = tile;
      tileDiv.appendChild(tile);
  }

  let redrawNeeded = false;
  let tilesToUpdate = [];
  drawing.addEventListener('needRedraw', (ev) => {
      redrawNeeded = true;
      tilesToUpdate.push(ev.detail);
  });
  const updateDrawing = () => {
      if (redrawNeeded) {
          redrawNeeded = false;
          const workTiles = tilesToUpdate;
          tilesToUpdate = [];
          const t = drawing.getTiles();
          for (const toUpdate of workTiles) {
              for (const i of toUpdate) {
                  if (i < 0) continue;
                  tiles[i].setTwoBitData(t.tiles[i]);
              }
          }
      }
      requestAnimationFrame(updateDrawing);
  };
  updateDrawing();
}