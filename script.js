var tileDiv;
var tiles;

function doStuff() {
    tileDiv = document.getElementById('tiles');
    const showButton = document.getElementById('show-tiles');
    showButton.addEventListener('click', (ev) => {
        showTiles();
        showButton.hidden = true;
    })
}


function showTiles() {
    const drawing = document.querySelector('two-bit-drawing');

    const numTiles = 160*144/64;
    tiles = new Array(numTiles);
    const tileData = drawing.getTiles();
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
            const t = drawing.getTiles();
            for (const toUpdate of tilesToUpdate) {
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