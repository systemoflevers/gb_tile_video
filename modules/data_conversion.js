function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let stringEncodedBinary = ''
    for (const b of bytes) {
        stringEncodedBinary += String.fromCharCode(b);
    }
    return window.btoa(stringEncodedBinary);
}

function arrayBufferToHexString(buffer, delimiter='', prefix='') {
    const bytes = new Uint8Array(buffer);
    let hexStringArray = [];
    for (const byte of bytes) {
        let hexByte = byte.toString(16);
        const padding = hexByte.length < 2 ? '0' : '';
        hexByte = `${prefix}${padding}${hexByte}`;
        hexStringArray.push(hexByte);
    }
    return hexStringArray.join(delimiter);
}

class TileSet {
    constructor(tileCount) {
        this.tileBytes = new Uint8Array(tileCount * 64);
        this.tiles = new Array(tileCount);
        for (let i = 0; i < tileCount; i++) {
            this.tiles[i] = this.tileBytes.subarray(i * 64, (i + 1) * 64);
        }
    }

    getPixel(tile, x, y) {
        return this.tiles[tile][x + y * 8];
    }

    setPixel(tile, x, y, v) {
        this.tiles[tile][x + y * 8] = v;
    }

    toGBTileData() {
        const gbTileData = new Uint8Array(this.tiles.length * 16);
        for (let i = 0; i < this.tiles.length; i++) {
            const gbTile = gbTileData.subarray(i * 16, (i + 1) * 16);
            byteTileToGBTile(this.tiles[i], gbTile); 
        }
        return gbTileData;
    }
}

/**
 * Converts an array of pixels into tiles. Tiles are 8x8 pixels big and the
 * pixel data should divide cleanly into tiles.
 * 
 * @param {!ArrayBuffer} pixels The pixel data array to convert. Each byte is
 *     a pixel. The length should be width*height.
 * @param {number} width Should be divisible by 8.
 * @param {number} height Should be divisible by 8.
 */
function pixelArrayToTiles(pixels, width, height) {
    if (pixels.byteLength !== width * height) {
        return null;
    }
    if (width % 8 !== 0 && height % 8 !== 0) {
        return null;
    }
    const widthInTiles = width / 8;
    const heightInTiles = height / 8;
    const pixelBytes = new Uint8Array(pixels);

    const tiles = new TileSet((width * height) / 64);
    for (let x = 0; x < width; x++) {
        const tileX = Math.floor(x / 8);
        for (let y = 0; y < height; y++)  {
            const tileY = Math.floor(y / 8);
            const tileNumber = tileY * widthInTiles + tileX;
            const pixelIndex = x + y * width;
            tiles.setPixel(tileNumber, x % 8, y % 8, pixelBytes[pixelIndex]);
        }
    }
    const gbTile = byteTileToGBTile(tiles.tiles[0]);
    let hex = [];
    for (const i of gbTile) {
        let byte = i.toString(16);
        if (byte.length < 2) {
            byte = '0' + byte;
        }
        hex.push(byte);
    }
    console.log(gbTile);
    console.log(hex.join(' '));
    return tiles;
}

const HIGH_BITS = [0, 0, 1, 1];
const LOW_BITS = [0, 1, 0, 1];

function byteTileRowToGBTileRow(byteRow, outGBRow) {
    for (const pixel of byteRow) {
        outGBRow[0] <<= 1;
        outGBRow[1] <<= 1;
        outGBRow[0] |= LOW_BITS[pixel];
        outGBRow[1] |= HIGH_BITS[pixel];
    }
}

function byteTileToGBTile(tile, opt_gbTile) {
    if (tile.byteLength !== 64) return null;
    
    const gbTile = opt_gbTile || new Uint8Array(16);
    for (let i = 0; i < 8; i++) {
        const byteTileRow = tile.subarray(i * 8, (i + 1) * 8);
        const gbTileRow = gbTile.subarray(i * 2, (i + 1) * 2);
        byteTileRowToGBTileRow(byteTileRow, gbTileRow);
    }
    return gbTile;
}

export {
    arrayBufferToBase64,
    arrayBufferToHexString,
    byteTileToGBTile,
    pixelArrayToTiles,
}