function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let stringEncodedBinary = ''
    for (const b of bytes) {
        stringEncodedBinary += String.fromCharCode(b);
    }
    return window.btoa(stringEncodedBinary);
}

function base64ToUint8Array(b64String) {
    const stringEncodedBinary = window.atob(b64String);
    const bytes = new Uint8Array(stringEncodedBinary.length);
    for (let i = 0; i < bytes.length; ++i) {
        bytes[i] = stringEncodedBinary.charCodeAt(i);
    }
    return bytes;
}

function arrayBufferToHexString(buffer, delimiter = '', prefix = '') {
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

class TileMap {
    constructor(widthInTiles, heightInTiles, tileSet) {
        this.tileSet = tileSet;
        this.widthInTiles = widthInTiles;
        this.heightInTiles = heightInTiles;
        this.tileCount = widthInTiles * heightInTiles;
        this.tileMap = new Array(this.tileCount);
        this.tileMap.fill(0);
    }

    static makeSimpleMap(widthInTiles, heightInTiles) {
        const tileCount = 256;
        const tileSet = new TileSet(tileCount);
        const tileMap = new TileMap(widthInTiles, heightInTiles, tileSet);
        tileMap.tileMap.forEach((v, i, arr) => {
            const x = i % widthInTiles;
            const y = Math.floor(i / widthInTiles);
            arr[i] = 0; //i;//(x%4) + 4*(y%4);
        });
        return tileMap;
    }

    static makeFullMap(widthInTiles, heightInTiles) {
        const tileCount = widthInTiles * heightInTiles;
        const tileSet = new TileSet(tileCount);
        const tileMap = new TileMap(widthInTiles, heightInTiles, tileSet);
        tileMap.tileMap.forEach((v, i, arr) => {
            const x = i % widthInTiles;
            const y = Math.floor(i / widthInTiles);
            arr[i] = i;
        });
        return tileMap;
    }

    static makeRandom(widthInTiles, heightInTiles) {
        const tileCount = Math.ceil(Math.random() * 359) + 1;
        const tileSet = new TileSet(tileCount);
        const tileMap = new TileMap(widthInTiles, heightInTiles, tileSet);
        tileMap.tileMap.forEach((v, i, arr) => {
            arr[i] = Math.floor(Math.random() * tileCount);
        });
        return tileMap;
    }

    /**
     * Maps an x,y coordinate to an index into the map entry array.
     */
    toMapIndex(x, y) {
        return Math.floor(y / 8) * this.widthInTiles + Math.floor(x / 8);
    }

    /**
     * Given an x,y coordinate returns the index of the tile displayed at that
     * coordinate and maps the coordinate to the tile's 8x8 coordinate space.
     * 
     * Example:
     * All map entries are set to tile 0 (everything is the same tile).
     * toTileXY(0, 0) = {tileIndex: 0, tileX: 0, tileY: 0}
     * toTileXY(8, 0) = {tileIndex: 0, tileX: 0, tileY: 0}
     * toTileXY(0, 8) = {tileIndex: 0, tileX: 0, tileY: 0}
     * toTileXY(1, 0) = {tileIndex: 0, tileX: 1, tileY: 0}
     * toTileXY(9, 0) = {tileIndex: 0, tileX: 1, tileY: 0}
     * 
     * Each map entry i is set to tile i (all unique tiles) the display is 20x18
     * tiles.
     * toTileXY(0, 0) = {tileIndex: 0, tileX: 0, tileY: 0}
     * toTileXY(8, 0) = {tileIndex: 1, tileX: 0, tileY: 0}
     * toTileXY(0, 8) = {tileIndex: 20, tileX: 0, tileY: 0}
     * toTileXY(1, 0) = {tileIndex: 0, tileX: 1, tileY: 0}
     * toTileXY(9, 0) = {tileIndex: 1, tileX: 1, tileY: 0}
     */
    toTileXY(x, y) {
        const mapIndex = this.toMapIndex(x, y);
        const tileIndex = this.tileMap[mapIndex];
        const tileX = x % 8;
        const tileY = y % 8;
        return {tileIndex, tileX, tileY};
    }

    setPixel(x, y, v) {
        const {tileIndex, tileX, tileY} = this.toTileXY(x, y);
        this.tileSet.setPixel(tileIndex, tileX, tileY, v);
        return tileIndex;
    }

    getPixel(x, y) {
        const {tileIndex, tileX, tileY} = this.toTileXY(x, y);
        return this.tileSet.getPixel(tileIndex, tileX, tileY);
    }

    /**
     * Renders the tile map as a drawing of size:
     * (widthInTiles*8)x(heightInTiles*8).
     * 
     * @return A Uint8Array of size this.widthInTiles*8*this.heightInTiles*8.
     *     Each Uint8 in the array is a two-bit value representing a pixel.
     */
    toPixelArray() {
        const width = this.widthInTiles * 8;
        const height = this.heightInTiles * 8;
        const pixelArray = new Uint8Array(this.tileCount * 8*8);
        
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                const i = x + y * width;
                pixelArray[i] = this.getPixel(x, y);
            }
        }
        return pixelArray;
    }

    /**
     * @returns The map and tile set in the GameBoy binary graphics format,
     *     stored as Uint8Arrays. Truncates the tile indexes to 1 byte each.
     */
    toGBData() {
        const tileMap = new Uint8Array(this.tileCount);
        for (let i = 0; i < this.tileCount; ++i) {
            tileMap[i] = this.tileMap[i];
        }
        const usedTileCount = Math.max(...this.tileMap) + 1;
        return {map: tileMap, tiles: this.tileSet.toGBTileData(usedTileCount)};
    }

    fromGBData(tileMap, tiles) {
        const tileCount = Math.min(tileMap.length, this.tileMap.length);
        for (let i = 0; i < tileCount; ++i) {
            this.tileMap[i] = tileMap[i];
        }
        this.tileSet.fromGBTileData(tiles);
    }
}

class TileSet {
    constructor(tileCount) {
        this.tileBytes = new Uint8Array(tileCount * 64);
        this.tileCount = tileCount;
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

    /**
     * Gets the tile data in GameBoy's graphics format (2BPP).
     */
    toGBTileData(tileCount) {
        if (!tileCount) {
            tileCount = this.tileCount;
        }
        const gbTileData = new Uint8Array(tileCount * 16);
        for (let i = 0; i < tileCount; i++) {
            const gbTile = gbTileData.subarray(i * 16, (i + 1) * 16);
            byteTileToGBTile(this.tiles[i], gbTile);
        }
        return gbTileData;
    }

    fromGBTileData(gbTileData) {
        const tileCount = Math.min(this.tiles.length, gbTileData.length / 16);
        for (let i = 0; i < tileCount; ++i) {
            const byteTile = this.tiles[i];
            const gbTile = gbTileData.subarray(i * 16, (i + 1) * 16);
            this.tiles[i] = gbTileToByteTile(gbTile, byteTile);
        }
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
        for (let y = 0; y < height; y++) {
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

function pixelByteFromGBTileRow(rowHighByte, rowLowByte, pixelIndex) {
    return (((rowHighByte >> (7-pixelIndex)) & 1) << 1) |
           (((rowLowByte >> (7-pixelIndex)) & 1));
}

function gbTileRowToByteTileRow(gbRow, outByteRow) {
    const gbRowHigh = gbRow[1];
    const gbRowLow = gbRow[0];
    for (let i = 0; i < 8; ++i) {
        outByteRow[i] = pixelByteFromGBTileRow(gbRowHigh, gbRowLow, i);
    }
    return outByteRow;
}

/**
 * Turns a 1-byte-per-pixel 8x8 tile into the GameBoy 2-bit-per-pixel format.
 * Each row is two bytes. The two bits of a pixel are split into that pixel's
 * row's two bytes.
 * Note: Each byte in the 1-byte-per-pixel tile is still expected to 0, 1, 2, or
 * 3. Not arbitrary values.
 */
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

function gbTileToByteTile(gbTile, opt_byteTile) {
    if (gbTile.byteLength != 16) return null;

    const byteTile = opt_byteTile || new Uint8Array(64);
    for (let row = 0; row < 8; ++row) {
        const gbTileRow = gbTile.subarray(row * 2, (row + 1) * 2);
        const byteTileRow = byteTile.subarray(row * 8, (row + 1) * 8);
        gbTileRowToByteTileRow(gbTileRow, byteTileRow);
    }
    return byteTile;
}

export {
    arrayBufferToBase64,
    base64ToUint8Array,
    arrayBufferToHexString,
    byteTileToGBTile,
    gbTileToByteTile,
    pixelArrayToTiles,
    TileMap,
}