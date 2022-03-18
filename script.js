var tileDiv;
var tiles;
var tile;

function doStuff() {
    tileDiv = document.getElementById('tiles');
    const showButton = document.getElementById('show-tiles');
    showButton.addEventListener('click', (ev) => {
        showTiles();
        showButton.hidden = true;
    });
    const drawing = document.querySelector('two-bit-drawing');
    const toolPicker = document.querySelector('tool-picker');
    toolPicker.addEventListener('tool-change', (ev) => {
        drawing.tool = ev.detail;
    });
    const nextTile = document.getElementById('next-tile');
    nextTile.addEventListener('click', (ev) => {
        drawing.getNextTile();
        updateTileSummary()
    });
    const showGBData = document.getElementById('show-gb-data');
    showGBData.addEventListener('click', (ev) => {
        const gbDataDiv = document.getElementById('gb-data');
        const redrawHandler = (ev) => {
            const gbData = drawing.getB64JSONGBData();
            gbDataDiv.innerText = gbData;
        };
        drawing.addEventListener('needRedraw', redrawHandler);
        showGBData.hidden = true;
        redrawHandler();
    });
    const downloadLink = document.getElementById('download-link');
    drawing.addEventListener('needRedraw', (ev) => {
        const gbData = drawing.getB64JSONGBData();
        downloadLink.href = `data:application/json,${gbData}`;
    });
    const printHex = document.getElementById('print-hex-data');
    printHex.addEventListener('click', (ev) => {
        console.log(drawing.twoBitCanvas.getGBDataAsHex());
    });
    const printB64 = document.getElementById('print-b64-data');
    printB64.addEventListener('click', (ev) => {
        console.log(drawing.twoBitCanvas.getGBDataAsB64());
    });
    tile = document.getElementById('tile-drawing');
    if (drawing.selectedTile != null) {
        const tileData = drawing.tileMap.tileSet.tiles[drawing.selectedTile];
        tile.tileMap.tileSet.tiles[0] = tileData;
        tile.needRedraw = true;
    }
    updateTileSummary();
    drawing.addEventListener('tileSelected', (ev) => {
        const tileData = drawing.tileMap.tileSet.tiles[ev.detail];
        tile.tileMap.tileSet.tiles[0] = tileData;
        tile.needRedraw = true;
        updateTileSummary();
    });
    tile.addEventListener('needRedraw', (ev) => drawing.updateTile(drawing.selectedTile));
    drawing.addEventListener('needRedraw', (ev) => tile.needRedraw = true);
}

function updateTileSummary() {
    const container = document.getElementById('tile-summary');
    const drawing = document.getElementById('main');
    const selected = drawing.selectedTile;
    const nextTile = drawing.nextTile;
    const total = drawing.tileMap.tileSet.tileCount;

    container.innerHTML = '';
    container.innerText = `selected: ${selected} next: ${nextTile} of ${total}`;
}


function showTiles() {
    const drawing = document.querySelector('two-bit-drawing#main');

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

function getB64EncodedMapData() {
    const drawing = document.querySelector('two-bit-drawing#main');
}