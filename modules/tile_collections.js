import {byteTileToGBTile, gbTileToByteTile} from './data_conversion.js';

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
    return { tileIndex, tileX, tileY };
  }

  setTile(mapIndex, tileIndex) {
    this.tileMap[mapIndex] = tileIndex;
  }

  setPixel(x, y, v) {
    const { tileIndex, tileX, tileY } = this.toTileXY(x, y);
    this.tileSet.setPixel(tileIndex, tileX, tileY, v);
    return tileIndex;
  }

  getPixel(x, y) {
    const { tileIndex, tileX, tileY } = this.toTileXY(x, y);
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
    const pixelArray = new Uint8Array(this.tileCount * 8 * 8);

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
    return { map: tileMap, tiles: this.tileSet.toGBTileData(usedTileCount) };
  }

  fromGBData(tileMap, tiles) {
    const tileCount = Math.min(tileMap.length, this.tileMap.length);
    for (let i = 0; i < tileCount; ++i) {
      this.tileMap[i] = tileMap[i];
    }
    this.tileSet.fromGBTileData(tiles);
  }
}

/**
 * A tile map that will copy a tile whenever it's shared and modified. So if
 * two map entries point to the same tile (tile-0) and there's a setPixel() call
 * that  sets a pixel in the 1st map entry it will cause the existing tile's
 * content to be copied to a "fresh", unused tile (tile-1). The 1st map entry
 * will be updated to point to tile-1 and setPixel() will modify tile-1.
 * 
 * If there are no more unused tiles then it just modifies the shared tile.
 */
class CopyOnWriteMap extends TileMap {
  constructor(widthInTiles, heightInTiles, tileSet) {
    super(widthInTiles, heightInTiles, tileSet);
    this.reverseMap = new Array(this.tileSet.tileCount);
    for (let i = 0; i < this.reverseMap.length; ++i) {
      this.reverseMap[i] = new Set();
    }
    this.computeReverseMap();
  }

  static makeSimpleMap(widthInTiles, heightInTiles) {
    const tileCount = 256;
    const tileSet = new TileSet(tileCount);
    const tileMap = new CopyOnWriteMap(widthInTiles, heightInTiles, tileSet);
    tileMap.tileMap.forEach((v, i, arr) => {
      const x = i % widthInTiles;
      const y = Math.floor(i / widthInTiles);
      arr[i] = 0; //i;//(x%4) + 4*(y%4);
    });
    return tileMap;
  }

  computeReverseMap() {
    for (let i = 0; i < this.tileMap.length; ++i) {
      const tileIndex = this.tileMap[i];
      this.reverseMap[tileIndex].add(i);
    }
  }

  copyToUnusedTileIfNeeded(mapIndex) {
    const tileIndex = this.tileMap[mapIndex];
    if (this.reverseMap[tileIndex].size <= 1) {
      return;
    }
    const unusedTileIndex = this.reverseMap.findIndex(
      (mapEntries) => mapEntries.size === 0);
    if (unusedTileIndex < 0) {
      // No unused tiles, do nothing.
      return;
    }

    const oldTile = this.tileSet.tiles[tileIndex];
    const newTile = this.tileSet.tiles[unusedTileIndex];
    newTile.set(oldTile);
    this.tileMap[mapIndex] = unusedTileIndex;
    this.reverseMap[unusedTileIndex].add(mapIndex);
    this.reverseMap[tileIndex].delete(mapIndex);
  }

  setPixel(x, y, v) {
    const mapIndex = this.toMapIndex(x, y);
    this.copyToUnusedTileIfNeeded(mapIndex);
    return super.setPixel(x, y, v);
  }

  setTile(mapIndex, tileIndex) {
    this.reverseMap[this.tileMap[mapIndex]].delete(mapIndex);
    this.reverseMap[tileIndex].add(mapIndex);
    super.setTile(mapIndex, tileIndex);
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

  setTile(i, tileBytes) {
    for (let p = 0; p < 64; ++p) {
      this.tiles[i][p] = tileBytes[p];
    }
  }
}

export {
  TileMap,
  CopyOnWriteMap,
  TileSet,
}