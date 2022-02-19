function ArrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let stringEncodedBinary = ''
    for (const b of bytes) {
        stringEncodedBinary += String.fromCharCode(b);
    }
    return window.btoa(stringEncodedBinary);
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
function PixelArrayToTiles(pixels, width, height) {
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
    return tiles;
}

export {
    ArrayBufferToBase64,
    PixelArrayToTiles
}