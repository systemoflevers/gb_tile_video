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
    for (let i = 0; i < numTiles; i++) {
        const tile = document.createElement('two-bit-canvas');
        tile.width = 8;
        tile.height = 8;

        tiles[i] = tile;
        tileDiv.appendChild(tile);
    }

    let redrawNeeded = false;
    let tilesToUpdate = null;
    drawing.addEventListener('needRedraw', (ev) => {
        redrawNeeded = true;
        tilesToUpdate = ev.detail;
    });
    const updateDrawing = () => {
        if (redrawNeeded) {
            redrawNeeded = false;
            const t = drawing.getTiles();
            for (const i of tilesToUpdate) {
                if (i < 0) continue;
                tiles[i].setTwoBitData(t.tiles[i]);
            }
        }
        requestAnimationFrame(updateDrawing);
    };
    updateDrawing();
}