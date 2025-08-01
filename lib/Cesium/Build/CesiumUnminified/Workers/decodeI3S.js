/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.125
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  require_draco_decoder_nodejs
} from "./chunk-JFKLX6VR.js";
import {
  Color_default
} from "./chunk-QCWJ4XF6.js";
import {
  createTaskProcessorWorker_default
} from "./chunk-SDEL6GIF.js";
import {
  WebMercatorProjection_default
} from "./chunk-H4QINGKV.js";
import {
  Cartesian3_default,
  Cartographic_default,
  Ellipsoid_default,
  Matrix3_default
} from "./chunk-4SN33TQR.js";
import {
  Math_default
} from "./chunk-CZ4RC7BS.js";
import {
  defaultValue_default
} from "./chunk-SGH7UNZN.js";
import {
  Check_default
} from "./chunk-N2TV4RJQ.js";
import {
  __toESM,
  defined_default
} from "./chunk-6MI7ARVC.js";

// packages/engine/Source/Workers/decodeI3S.js
var import_draco_decoder_nodejs = __toESM(require_draco_decoder_nodejs(), 1);

// packages/engine/Source/Core/srgbToLinear.js
function srgbToLinear(value) {
  Check_default.defined("value", value);
  if (value <= 0.04045) {
    return value * 0.07739938080495357;
  }
  return Math.pow(
    // eslint-disable-next-line no-loss-of-precision
    (value + 0.055) * 0.9478672985781991,
    2.4
  );
}
var srgbToLinear_default = srgbToLinear;

// packages/engine/Source/Workers/decodeI3S.js
var draco;
function bilinearInterpolate(tx, ty, h00, h10, h01, h11) {
  const a = h00 * (1 - tx) + h10 * tx;
  const b = h01 * (1 - tx) + h11 * tx;
  return a * (1 - ty) + b * ty;
}
function sampleMap(u, v, width, data) {
  const address = u + v * width;
  return data[address];
}
function sampleGeoid(sampleX, sampleY, geoidData) {
  const extent = geoidData.nativeExtent;
  let x = (sampleX - extent.west) / (extent.east - extent.west) * (geoidData.width - 1);
  let y = (sampleY - extent.south) / (extent.north - extent.south) * (geoidData.height - 1);
  const xi = Math.floor(x);
  let yi = Math.floor(y);
  x -= xi;
  y -= yi;
  const xNext = xi < geoidData.width ? xi + 1 : xi;
  let yNext = yi < geoidData.height ? yi + 1 : yi;
  yi = geoidData.height - 1 - yi;
  yNext = geoidData.height - 1 - yNext;
  const h00 = sampleMap(xi, yi, geoidData.width, geoidData.buffer);
  const h10 = sampleMap(xNext, yi, geoidData.width, geoidData.buffer);
  const h01 = sampleMap(xi, yNext, geoidData.width, geoidData.buffer);
  const h11 = sampleMap(xNext, yNext, geoidData.width, geoidData.buffer);
  let finalHeight = bilinearInterpolate(x, y, h00, h10, h01, h11);
  finalHeight = finalHeight * geoidData.scale + geoidData.offset;
  return finalHeight;
}
function sampleGeoidFromList(lon, lat, geoidDataList) {
  for (let i = 0; i < geoidDataList.length; i++) {
    const localExtent = geoidDataList[i].nativeExtent;
    let localPt = new Cartesian3_default();
    if (geoidDataList[i].projectionType === "WebMercator") {
      const radii = geoidDataList[i].projection._ellipsoid._radii;
      const webMercatorProj = new WebMercatorProjection_default(
        new Ellipsoid_default(radii.x, radii.y, radii.z)
      );
      localPt = webMercatorProj.project(new Cartographic_default(lon, lat, 0));
    } else {
      localPt.x = lon;
      localPt.y = lat;
    }
    if (localPt.x > localExtent.west && localPt.x < localExtent.east && localPt.y > localExtent.south && localPt.y < localExtent.north) {
      return sampleGeoid(localPt.x, localPt.y, geoidDataList[i]);
    }
  }
  return 0;
}
function orthometricToEllipsoidal(vertexCount, position, scale_x, scale_y, center, geoidDataList, fast) {
  if (fast) {
    return;
  }
  const centerHeight = sampleGeoidFromList(
    center.longitude,
    center.latitude,
    geoidDataList
  );
  for (let i = 0; i < vertexCount; ++i) {
    const height = sampleGeoidFromList(
      center.longitude + Math_default.toRadians(scale_x * position[i * 3]),
      center.latitude + Math_default.toRadians(scale_y * position[i * 3 + 1]),
      geoidDataList
    );
    position[i * 3 + 2] += height - centerHeight;
  }
}
function transformToLocal(vertexCount, positions, normals, cartographicCenter, cartesianCenter, parentRotation, ellipsoidRadiiSquare, scale_x, scale_y) {
  if (vertexCount === 0 || !defined_default(positions) || positions.length === 0) {
    return;
  }
  const ellipsoid = new Ellipsoid_default(
    Math.sqrt(ellipsoidRadiiSquare.x),
    Math.sqrt(ellipsoidRadiiSquare.y),
    Math.sqrt(ellipsoidRadiiSquare.z)
  );
  for (let i = 0; i < vertexCount; ++i) {
    const indexOffset = i * 3;
    const indexOffset1 = indexOffset + 1;
    const indexOffset2 = indexOffset + 2;
    const cartographic = new Cartographic_default();
    cartographic.longitude = cartographicCenter.longitude + Math_default.toRadians(scale_x * positions[indexOffset]);
    cartographic.latitude = cartographicCenter.latitude + Math_default.toRadians(scale_y * positions[indexOffset1]);
    cartographic.height = cartographicCenter.height + positions[indexOffset2];
    const position = {};
    ellipsoid.cartographicToCartesian(cartographic, position);
    position.x -= cartesianCenter.x;
    position.y -= cartesianCenter.y;
    position.z -= cartesianCenter.z;
    const rotatedPosition = {};
    Matrix3_default.multiplyByVector(parentRotation, position, rotatedPosition);
    positions[indexOffset] = rotatedPosition.x;
    positions[indexOffset1] = rotatedPosition.y;
    positions[indexOffset2] = rotatedPosition.z;
    if (defined_default(normals)) {
      const normal = new Cartesian3_default(
        normals[indexOffset],
        normals[indexOffset1],
        normals[indexOffset2]
      );
      const rotatedNormal = {};
      Matrix3_default.multiplyByVector(parentRotation, normal, rotatedNormal);
      normals[indexOffset] = rotatedNormal.x;
      normals[indexOffset1] = rotatedNormal.y;
      normals[indexOffset2] = rotatedNormal.z;
    }
  }
}
function cropUVs(vertexCount, uv0s, uvRegions) {
  for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
    const minU = uvRegions[vertexIndex * 4] / 65535;
    const minV = uvRegions[vertexIndex * 4 + 1] / 65535;
    const scaleU = (uvRegions[vertexIndex * 4 + 2] - uvRegions[vertexIndex * 4]) / 65535;
    const scaleV = (uvRegions[vertexIndex * 4 + 3] - uvRegions[vertexIndex * 4 + 1]) / 65535;
    uv0s[vertexIndex * 2] *= scaleU;
    uv0s[vertexIndex * 2] += minU;
    uv0s[vertexIndex * 2 + 1] *= scaleV;
    uv0s[vertexIndex * 2 + 1] += minV;
  }
}
function generateIndexArray(vertexCount, indices, colors, splitGeometryByColorTransparency) {
  const indexArray = new Uint32Array(vertexCount);
  const vertexIndexFn = defined_default(indices) ? (vertexIndex) => indices[vertexIndex] : (vertexIndex) => vertexIndex;
  let transparentVertexOffset = 0;
  if (splitGeometryByColorTransparency && defined_default(colors)) {
    const isVertexTransparentFn = (vertexIndex) => colors[vertexIndexFn(vertexIndex) * 4 + 3] < 255;
    for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 3) {
      if (!isVertexTransparentFn(vertexIndex) && !isVertexTransparentFn(vertexIndex + 1) && !isVertexTransparentFn(vertexIndex + 2)) {
        indexArray[transparentVertexOffset++] = vertexIndexFn(vertexIndex);
        indexArray[transparentVertexOffset++] = vertexIndexFn(vertexIndex + 1);
        indexArray[transparentVertexOffset++] = vertexIndexFn(vertexIndex + 2);
      }
    }
    if (transparentVertexOffset > 0) {
      let offset = transparentVertexOffset;
      for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 3) {
        if (isVertexTransparentFn(vertexIndex) || isVertexTransparentFn(vertexIndex + 1) || isVertexTransparentFn(vertexIndex + 2)) {
          indexArray[offset++] = vertexIndexFn(vertexIndex);
          indexArray[offset++] = vertexIndexFn(vertexIndex + 1);
          indexArray[offset++] = vertexIndexFn(vertexIndex + 2);
        }
      }
    } else {
      for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
        indexArray[vertexIndex] = vertexIndexFn(vertexIndex);
      }
    }
  } else {
    transparentVertexOffset = vertexCount;
    for (let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
      indexArray[vertexIndex] = vertexIndexFn(vertexIndex);
    }
  }
  return {
    indexArray,
    transparentVertexOffset
  };
}
function getFeatureHash(symbologyData, outlinesHash, featureIndex) {
  const featureHash = outlinesHash[featureIndex];
  if (defined_default(featureHash)) {
    return featureHash;
  }
  const newFeatureHash = outlinesHash[featureIndex] = {
    positions: {},
    indices: {},
    edges: {}
  };
  const featureSymbology = defaultValue_default(
    symbologyData[featureIndex],
    symbologyData.default
  );
  newFeatureHash.hasOutline = defined_default(featureSymbology?.edges);
  return newFeatureHash;
}
function addVertexToHash(indexHash, positionHash, vertexIndex, positions) {
  if (!defined_default(indexHash[vertexIndex])) {
    const startPositionIndex = vertexIndex * 3;
    let coordinateHash = positionHash;
    for (let index = 0; index < 3; index++) {
      const coordinate = positions[startPositionIndex + index];
      if (!defined_default(coordinateHash[coordinate])) {
        coordinateHash[coordinate] = {};
      }
      coordinateHash = coordinateHash[coordinate];
    }
    if (!defined_default(coordinateHash.index)) {
      coordinateHash.index = vertexIndex;
    }
    indexHash[vertexIndex] = coordinateHash.index;
  }
}
function addEdgeToHash(edgeHash, vertexAIndex, vertexBIndex, vertexAIndexUnique, vertexBIndexUnique, normalIndex) {
  let startVertexIndex;
  let endVertexIndex;
  if (vertexAIndexUnique < vertexBIndexUnique) {
    startVertexIndex = vertexAIndexUnique;
    endVertexIndex = vertexBIndexUnique;
  } else {
    startVertexIndex = vertexBIndexUnique;
    endVertexIndex = vertexAIndexUnique;
  }
  let edgeStart = edgeHash[startVertexIndex];
  if (!defined_default(edgeStart)) {
    edgeStart = edgeHash[startVertexIndex] = {};
  }
  let edgeEnd = edgeStart[endVertexIndex];
  if (!defined_default(edgeEnd)) {
    edgeEnd = edgeStart[endVertexIndex] = {
      normalsIndex: [],
      outlines: []
    };
  }
  edgeEnd.normalsIndex.push(normalIndex);
  if (edgeEnd.outlines.length === 0 || vertexAIndex !== vertexAIndexUnique || vertexBIndex !== vertexBIndexUnique) {
    edgeEnd.outlines.push(vertexAIndex, vertexBIndex);
  }
}
function generateOutlinesHash(symbologyData, featureIndexArray, indexArray, positions) {
  const outlinesHash = [];
  for (let i = 0; i < indexArray.length; i += 3) {
    const featureIndex = defined_default(featureIndexArray) ? featureIndexArray[indexArray[i]] : "default";
    const featureHash = getFeatureHash(
      symbologyData,
      outlinesHash,
      featureIndex
    );
    if (!featureHash.hasOutline) {
      continue;
    }
    const indexHash = featureHash.indices;
    const positionHash = featureHash.positions;
    for (let vertex = 0; vertex < 3; vertex++) {
      const vertexIndex = indexArray[i + vertex];
      addVertexToHash(indexHash, positionHash, vertexIndex, positions);
    }
    const edgeHash = featureHash.edges;
    for (let vertex = 0; vertex < 3; vertex++) {
      const vertexIndex = indexArray[i + vertex];
      const nextVertexIndex = indexArray[i + (vertex + 1) % 3];
      const uniqueVertexIndex = indexHash[vertexIndex];
      const uniqueNextVertexIndex = indexHash[nextVertexIndex];
      addEdgeToHash(
        edgeHash,
        vertexIndex,
        nextVertexIndex,
        uniqueVertexIndex,
        uniqueNextVertexIndex,
        i
      );
    }
  }
  return outlinesHash;
}
var calculateFaceNormalA = new Cartesian3_default();
var calculateFaceNormalB = new Cartesian3_default();
var calculateFaceNormalC = new Cartesian3_default();
function calculateFaceNormal(normals, vertexAIndex, indexArray, positions) {
  const positionAIndex = indexArray[vertexAIndex] * 3;
  const positionBIndex = indexArray[vertexAIndex + 1] * 3;
  const positionCIndex = indexArray[vertexAIndex + 2] * 3;
  Cartesian3_default.fromArray(positions, positionAIndex, calculateFaceNormalA);
  Cartesian3_default.fromArray(positions, positionBIndex, calculateFaceNormalB);
  Cartesian3_default.fromArray(positions, positionCIndex, calculateFaceNormalC);
  Cartesian3_default.subtract(
    calculateFaceNormalB,
    calculateFaceNormalA,
    calculateFaceNormalB
  );
  Cartesian3_default.subtract(
    calculateFaceNormalC,
    calculateFaceNormalA,
    calculateFaceNormalC
  );
  Cartesian3_default.cross(
    calculateFaceNormalB,
    calculateFaceNormalC,
    calculateFaceNormalA
  );
  const magnitude = Cartesian3_default.magnitude(calculateFaceNormalA);
  if (magnitude !== 0) {
    Cartesian3_default.divideByScalar(
      calculateFaceNormalA,
      magnitude,
      calculateFaceNormalA
    );
  }
  const normalAIndex = vertexAIndex * 3;
  const normalBIndex = (vertexAIndex + 1) * 3;
  const normalCIndex = (vertexAIndex + 2) * 3;
  Cartesian3_default.pack(calculateFaceNormalA, normals, normalAIndex);
  Cartesian3_default.pack(calculateFaceNormalA, normals, normalBIndex);
  Cartesian3_default.pack(calculateFaceNormalA, normals, normalCIndex);
}
var isEdgeSmoothA = new Cartesian3_default();
var isEdgeSmoothB = new Cartesian3_default();
function isEdgeSmooth(normals, normalAIndex, normalBIndex) {
  Cartesian3_default.fromArray(normals, normalAIndex, isEdgeSmoothA);
  Cartesian3_default.fromArray(normals, normalBIndex, isEdgeSmoothB);
  const cosine = Cartesian3_default.dot(isEdgeSmoothA, isEdgeSmoothB);
  const sine = Cartesian3_default.magnitude(
    Cartesian3_default.cross(isEdgeSmoothA, isEdgeSmoothB, isEdgeSmoothA)
  );
  return Math.atan2(sine, cosine) < 0.25;
}
function addOutlinesForEdge(outlines, edgeData, indexArray, positions, normals) {
  if (edgeData.normalsIndex.length > 1) {
    const normalsByIndex = positions.length === normals.length;
    for (let indexA = 0; indexA < edgeData.normalsIndex.length; indexA++) {
      const vertexAIndex = edgeData.normalsIndex[indexA];
      if (!defined_default(normals[vertexAIndex * 3])) {
        calculateFaceNormal(normals, vertexAIndex, indexArray, positions);
      }
      if (indexA === 0) {
        continue;
      }
      for (let indexB = 0; indexB < indexA; indexB++) {
        const vertexBIndex = edgeData.normalsIndex[indexB];
        const normalAIndex = normalsByIndex ? indexArray[vertexAIndex] * 3 : vertexAIndex * 3;
        const normalBIndex = normalsByIndex ? indexArray[vertexBIndex] * 3 : vertexBIndex * 3;
        if (isEdgeSmooth(normals, normalAIndex, normalBIndex)) {
          return;
        }
      }
    }
  }
  outlines.push(...edgeData.outlines);
}
function addOutlinesForFeature(outlines, edgeHash, indexArray, positions, normals) {
  const edgeStartKeys = Object.keys(edgeHash);
  for (let startIndex = 0; startIndex < edgeStartKeys.length; startIndex++) {
    const edgeEnds = edgeHash[edgeStartKeys[startIndex]];
    const edgeEndKeys = Object.keys(edgeEnds);
    for (let endIndex = 0; endIndex < edgeEndKeys.length; endIndex++) {
      const edgeData = edgeEnds[edgeEndKeys[endIndex]];
      addOutlinesForEdge(outlines, edgeData, indexArray, positions, normals);
    }
  }
}
function generateOutlinesFromHash(outlinesHash, indexArray, positions, normals) {
  const outlines = [];
  const features = Object.keys(outlinesHash);
  for (let featureIndex = 0; featureIndex < features.length; featureIndex++) {
    const edgeHash = outlinesHash[features[featureIndex]].edges;
    addOutlinesForFeature(outlines, edgeHash, indexArray, positions, normals);
  }
  return outlines;
}
function generateOutlinesIndexArray(symbologyData, featureIndexArray, indexArray, positions, normals) {
  if (!defined_default(symbologyData) || Object.keys(symbologyData).length === 0) {
    return void 0;
  }
  const outlinesHash = generateOutlinesHash(
    symbologyData,
    featureIndexArray,
    indexArray,
    positions
  );
  if (!defined_default(normals) || indexArray.length * 3 !== normals.length) {
    normals = [];
  }
  const outlines = generateOutlinesFromHash(
    outlinesHash,
    indexArray,
    positions,
    normals
  );
  const outlinesIndexArray = outlines.length > 0 ? new Uint32Array(outlines) : void 0;
  return outlinesIndexArray;
}
function convertColorsArray(colors) {
  const colorsArray = new Float32Array(colors.length);
  for (let index = 0; index < colors.length; index += 4) {
    colorsArray[index] = srgbToLinear_default(Color_default.byteToFloat(colors[index]));
    colorsArray[index + 1] = srgbToLinear_default(Color_default.byteToFloat(colors[index + 1]));
    colorsArray[index + 2] = srgbToLinear_default(Color_default.byteToFloat(colors[index + 2]));
    colorsArray[index + 3] = Color_default.byteToFloat(colors[index + 3]);
  }
  return colorsArray;
}
function generateNormals(vertexCount, indices, positions, normals, uv0s, colors, featureIndex) {
  const result = {
    normals: void 0,
    positions: void 0,
    uv0s: void 0,
    colors: void 0,
    featureIndex: void 0,
    vertexCount: void 0
  };
  if (vertexCount === 0 || !defined_default(positions) || positions.length === 0 || defined_default(normals)) {
    return result;
  }
  if (defined_default(indices)) {
    result.vertexCount = indices.length;
    result.positions = new Float32Array(indices.length * 3);
    result.uv0s = defined_default(uv0s) ? new Float32Array(indices.length * 2) : void 0;
    result.colors = defined_default(colors) ? new Uint8Array(indices.length * 4) : void 0;
    result.featureIndex = defined_default(featureIndex) ? new Array(indices.length) : void 0;
    for (let i = 0; i < indices.length; i++) {
      const index = indices[i];
      result.positions[i * 3] = positions[index * 3];
      result.positions[i * 3 + 1] = positions[index * 3 + 1];
      result.positions[i * 3 + 2] = positions[index * 3 + 2];
      if (defined_default(result.uv0s)) {
        result.uv0s[i * 2] = uv0s[index * 2];
        result.uv0s[i * 2 + 1] = uv0s[index * 2 + 1];
      }
      if (defined_default(result.colors)) {
        result.colors[i * 4] = colors[index * 4];
        result.colors[i * 4 + 1] = colors[index * 4 + 1];
        result.colors[i * 4 + 2] = colors[index * 4 + 2];
        result.colors[i * 4 + 3] = colors[index * 4 + 3];
      }
      if (defined_default(result.featureIndex)) {
        result.featureIndex[i] = featureIndex[index];
      }
    }
    vertexCount = indices.length;
    positions = result.positions;
  }
  indices = new Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) {
    indices[i] = i;
  }
  result.normals = new Float32Array(indices.length * 3);
  for (let i = 0; i < indices.length; i += 3) {
    calculateFaceNormal(result.normals, i, indices, positions);
  }
  return result;
}
function generateGltfBuffer(vertexCount, indices, positions, normals, uv0s, colors, featureIndex, parameters) {
  if (vertexCount === 0 || !defined_default(positions) || positions.length === 0) {
    return {
      buffers: [],
      bufferViews: [],
      accessors: [],
      meshes: [],
      nodes: [],
      nodesInScene: []
    };
  }
  const buffers = [];
  const bufferViews = [];
  const accessors = [];
  const meshes = [];
  const nodes = [];
  const nodesInScene = [];
  const rootExtensions = {};
  const extensionsUsed = [];
  if (defined_default(indices)) {
    vertexCount = indices.length;
  }
  const { indexArray, transparentVertexOffset } = generateIndexArray(
    vertexCount,
    indices,
    colors,
    parameters.splitGeometryByColorTransparency
  );
  const indicesBlob = new Blob([indexArray], { type: "application/binary" });
  const indicesURL = URL.createObjectURL(indicesBlob);
  const endIndex = vertexCount;
  const featureIndexArray = parameters.enableFeatures && defined_default(featureIndex) ? new Float32Array(featureIndex.length) : void 0;
  let featureCount = 0;
  if (defined_default(featureIndexArray)) {
    for (let index = 0; index < featureIndex.length; ++index) {
      featureIndexArray[index] = featureIndex[index];
      const countByIndex = featureIndex[index] + 1;
      if (featureCount < countByIndex) {
        featureCount = countByIndex;
      }
    }
  }
  let outlinesIndicesURL;
  const outlinesIndexArray = generateOutlinesIndexArray(
    parameters.symbologyData,
    featureIndex,
    indexArray,
    positions,
    normals
  );
  if (defined_default(outlinesIndexArray)) {
    const outlinesIndicesBlob = new Blob([outlinesIndexArray], {
      type: "application/binary"
    });
    outlinesIndicesURL = URL.createObjectURL(outlinesIndicesBlob);
  }
  const meshPositions = positions.subarray(0, endIndex * 3);
  const positionsBlob = new Blob([meshPositions], {
    type: "application/binary"
  });
  const positionsURL = URL.createObjectURL(positionsBlob);
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < meshPositions.length / 3; i++) {
    minX = Math.min(minX, meshPositions[i * 3 + 0]);
    maxX = Math.max(maxX, meshPositions[i * 3 + 0]);
    minY = Math.min(minY, meshPositions[i * 3 + 1]);
    maxY = Math.max(maxY, meshPositions[i * 3 + 1]);
    minZ = Math.min(minZ, meshPositions[i * 3 + 2]);
    maxZ = Math.max(maxZ, meshPositions[i * 3 + 2]);
  }
  const meshNormals = normals ? normals.subarray(0, endIndex * 3) : void 0;
  let normalsURL;
  if (defined_default(meshNormals)) {
    const normalsBlob = new Blob([meshNormals], {
      type: "application/binary"
    });
    normalsURL = URL.createObjectURL(normalsBlob);
  }
  const meshUv0s = uv0s ? uv0s.subarray(0, endIndex * 2) : void 0;
  let uv0URL;
  if (defined_default(meshUv0s)) {
    const uv0Blob = new Blob([meshUv0s], { type: "application/binary" });
    uv0URL = URL.createObjectURL(uv0Blob);
  }
  const meshColorsInBytes = defined_default(colors) ? convertColorsArray(colors.subarray(0, endIndex * 4)) : void 0;
  let colorsURL;
  if (defined_default(meshColorsInBytes)) {
    const colorsBlob = new Blob([meshColorsInBytes], {
      type: "application/binary"
    });
    colorsURL = URL.createObjectURL(colorsBlob);
  }
  const meshFeatureId0 = defined_default(featureIndexArray) ? featureIndexArray.subarray(0, endIndex) : void 0;
  let featureId0URL;
  if (defined_default(meshFeatureId0)) {
    const featureId0Blob = new Blob([meshFeatureId0], {
      type: "application/binary"
    });
    featureId0URL = URL.createObjectURL(featureId0Blob);
  }
  const meshPropertyTable0 = defined_default(featureIndexArray) ? new Float32Array(featureCount) : void 0;
  let propertyTable0URL;
  if (defined_default(meshPropertyTable0)) {
    for (let index = 0; index < meshPropertyTable0.length; ++index) {
      meshPropertyTable0[index] = index;
    }
    const propertyTable0Blob = new Blob([meshPropertyTable0], {
      type: "application/binary"
    });
    propertyTable0URL = URL.createObjectURL(propertyTable0Blob);
  }
  const attributes = {};
  const extensions = {};
  attributes.POSITION = accessors.length;
  buffers.push({
    uri: positionsURL,
    byteLength: meshPositions.byteLength
  });
  bufferViews.push({
    buffer: buffers.length - 1,
    byteOffset: 0,
    byteLength: meshPositions.byteLength,
    target: 34962
  });
  accessors.push({
    bufferView: bufferViews.length - 1,
    byteOffset: 0,
    componentType: 5126,
    count: meshPositions.length / 3,
    type: "VEC3",
    max: [minX, minY, minZ],
    min: [maxX, maxY, maxZ]
  });
  if (defined_default(normalsURL)) {
    attributes.NORMAL = accessors.length;
    buffers.push({
      uri: normalsURL,
      byteLength: meshNormals.byteLength
    });
    bufferViews.push({
      buffer: buffers.length - 1,
      byteOffset: 0,
      byteLength: meshNormals.byteLength,
      target: 34962
    });
    accessors.push({
      bufferView: bufferViews.length - 1,
      byteOffset: 0,
      componentType: 5126,
      count: meshNormals.length / 3,
      type: "VEC3"
    });
  }
  if (defined_default(uv0URL)) {
    attributes.TEXCOORD_0 = accessors.length;
    buffers.push({
      uri: uv0URL,
      byteLength: meshUv0s.byteLength
    });
    bufferViews.push({
      buffer: buffers.length - 1,
      byteOffset: 0,
      byteLength: meshUv0s.byteLength,
      target: 34962
    });
    accessors.push({
      bufferView: bufferViews.length - 1,
      byteOffset: 0,
      componentType: 5126,
      count: meshUv0s.length / 2,
      type: "VEC2"
    });
  }
  if (defined_default(colorsURL)) {
    attributes.COLOR_0 = accessors.length;
    buffers.push({
      uri: colorsURL,
      byteLength: meshColorsInBytes.byteLength
    });
    bufferViews.push({
      buffer: buffers.length - 1,
      byteOffset: 0,
      byteLength: meshColorsInBytes.byteLength,
      target: 34962
    });
    accessors.push({
      bufferView: bufferViews.length - 1,
      byteOffset: 0,
      componentType: 5126,
      count: meshColorsInBytes.length / 4,
      type: "VEC4"
    });
  }
  if (defined_default(featureId0URL)) {
    attributes._FEATURE_ID_0 = accessors.length;
    buffers.push({
      uri: featureId0URL,
      byteLength: meshFeatureId0.byteLength
    });
    bufferViews.push({
      buffer: buffers.length - 1,
      byteOffset: 0,
      byteLength: meshFeatureId0.byteLength,
      target: 34963
    });
    accessors.push({
      bufferView: bufferViews.length - 1,
      byteOffset: 0,
      componentType: 5126,
      count: meshFeatureId0.length,
      type: "SCALAR"
    });
    extensions.EXT_mesh_features = {
      featureIds: [
        {
          attribute: 0,
          propertyTable: 0,
          featureCount
        }
      ]
    };
    extensionsUsed.push("EXT_mesh_features");
  }
  if (defined_default(propertyTable0URL)) {
    buffers.push({
      uri: propertyTable0URL,
      byteLength: meshPropertyTable0.byteLength
    });
    bufferViews.push({
      buffer: buffers.length - 1,
      byteOffset: 0,
      byteLength: meshPropertyTable0.byteLength,
      target: 34963
    });
    rootExtensions.EXT_structural_metadata = {
      schema: {
        id: "i3s-metadata-schema-001",
        name: "I3S metadata schema 001",
        description: "The schema for I3S metadata",
        version: "1.0",
        classes: {
          feature: {
            name: "feature",
            description: "Feature metadata",
            properties: {
              index: {
                description: "The feature index",
                type: "SCALAR",
                componentType: "FLOAT32",
                required: true
              }
            }
          }
        }
      },
      propertyTables: [
        {
          name: "feature-indices-mapping",
          class: "feature",
          count: featureCount,
          properties: {
            index: {
              values: bufferViews.length - 1
            }
          }
        }
      ]
    };
    extensionsUsed.push("EXT_structural_metadata");
  }
  if (defined_default(outlinesIndicesURL)) {
    buffers.push({
      uri: outlinesIndicesURL,
      byteLength: outlinesIndexArray.byteLength
    });
    bufferViews.push({
      buffer: buffers.length - 1,
      byteOffset: 0,
      byteLength: outlinesIndexArray.byteLength,
      target: 34963
    });
    accessors.push({
      bufferView: bufferViews.length - 1,
      byteOffset: 0,
      componentType: 5125,
      count: outlinesIndexArray.length,
      type: "SCALAR"
    });
    extensions.CESIUM_primitive_outline = {
      indices: accessors.length - 1
    };
    extensionsUsed.push("CESIUM_primitive_outline");
  }
  buffers.push({
    uri: indicesURL,
    byteLength: indexArray.byteLength
  });
  bufferViews.push({
    buffer: buffers.length - 1,
    byteOffset: 0,
    byteLength: indexArray.byteLength,
    target: 34963
  });
  const meshPrimitives = [];
  if (transparentVertexOffset > 0) {
    accessors.push({
      bufferView: bufferViews.length - 1,
      byteOffset: 0,
      componentType: 5125,
      count: transparentVertexOffset,
      type: "SCALAR"
    });
    meshPrimitives.push({
      attributes,
      indices: accessors.length - 1,
      material: meshPrimitives.length,
      extensions
    });
  }
  if (transparentVertexOffset < vertexCount) {
    accessors.push({
      bufferView: bufferViews.length - 1,
      byteOffset: 4 * transparentVertexOffset,
      // skip 4 bytes for each opaque vertex
      componentType: 5125,
      count: vertexCount - transparentVertexOffset,
      type: "SCALAR"
    });
    meshPrimitives.push({
      attributes,
      indices: accessors.length - 1,
      material: meshPrimitives.length,
      extensions,
      extra: {
        isTransparent: true
      }
    });
  }
  meshes.push({
    primitives: meshPrimitives
  });
  nodesInScene.push(0);
  nodes.push({ mesh: 0 });
  return {
    buffers,
    bufferViews,
    accessors,
    meshes,
    nodes,
    nodesInScene,
    rootExtensions,
    extensionsUsed
  };
}
function decode(data, schema, bufferInfo, featureData) {
  const magicNumber = new Uint8Array(data, 0, 5);
  if (magicNumber[0] === "D".charCodeAt() && magicNumber[1] === "R".charCodeAt() && magicNumber[2] === "A".charCodeAt() && magicNumber[3] === "C".charCodeAt() && magicNumber[4] === "O".charCodeAt()) {
    return decodeDracoEncodedGeometry(data, bufferInfo);
  }
  return decodeBinaryGeometry(data, schema, bufferInfo, featureData);
}
function decodeDracoEncodedGeometry(data) {
  const dracoDecoderModule = draco;
  const buffer = new dracoDecoderModule.DecoderBuffer();
  const byteArray = new Uint8Array(data);
  buffer.Init(byteArray, byteArray.length);
  const dracoDecoder = new dracoDecoderModule.Decoder();
  const geometryType = dracoDecoder.GetEncodedGeometryType(buffer);
  const metadataQuerier = new dracoDecoderModule.MetadataQuerier();
  let dracoGeometry;
  let status;
  if (geometryType === dracoDecoderModule.TRIANGULAR_MESH) {
    dracoGeometry = new dracoDecoderModule.Mesh();
    status = dracoDecoder.DecodeBufferToMesh(buffer, dracoGeometry);
  }
  const decodedGeometry = {
    vertexCount: [0],
    featureCount: 0
  };
  if (defined_default(status) && status.ok() && dracoGeometry.ptr !== 0) {
    const faceCount = dracoGeometry.num_faces();
    const attributesCount = dracoGeometry.num_attributes();
    const vertexCount = dracoGeometry.num_points();
    decodedGeometry.indices = new Uint32Array(faceCount * 3);
    const faces = decodedGeometry.indices;
    decodedGeometry.vertexCount[0] = vertexCount;
    decodedGeometry.scale_x = 1;
    decodedGeometry.scale_y = 1;
    const face = new dracoDecoderModule.DracoInt32Array(3);
    for (let faceIndex = 0; faceIndex < faceCount; ++faceIndex) {
      dracoDecoder.GetFaceFromMesh(dracoGeometry, faceIndex, face);
      faces[faceIndex * 3] = face.GetValue(0);
      faces[faceIndex * 3 + 1] = face.GetValue(1);
      faces[faceIndex * 3 + 2] = face.GetValue(2);
    }
    dracoDecoderModule.destroy(face);
    for (let attrIndex = 0; attrIndex < attributesCount; ++attrIndex) {
      const dracoAttribute = dracoDecoder.GetAttribute(
        dracoGeometry,
        attrIndex
      );
      const attributeData = decodeDracoAttribute(
        dracoDecoderModule,
        dracoDecoder,
        dracoGeometry,
        dracoAttribute,
        vertexCount
      );
      const dracoAttributeType = dracoAttribute.attribute_type();
      let attributei3sName = "unknown";
      if (dracoAttributeType === dracoDecoderModule.POSITION) {
        attributei3sName = "positions";
      } else if (dracoAttributeType === dracoDecoderModule.NORMAL) {
        attributei3sName = "normals";
      } else if (dracoAttributeType === dracoDecoderModule.COLOR) {
        attributei3sName = "colors";
      } else if (dracoAttributeType === dracoDecoderModule.TEX_COORD) {
        attributei3sName = "uv0s";
      }
      const metadata = dracoDecoder.GetAttributeMetadata(
        dracoGeometry,
        attrIndex
      );
      if (metadata.ptr !== 0) {
        const numEntries = metadataQuerier.NumEntries(metadata);
        for (let entry = 0; entry < numEntries; ++entry) {
          const entryName = metadataQuerier.GetEntryName(metadata, entry);
          if (entryName === "i3s-scale_x") {
            decodedGeometry.scale_x = metadataQuerier.GetDoubleEntry(
              metadata,
              "i3s-scale_x"
            );
          } else if (entryName === "i3s-scale_y") {
            decodedGeometry.scale_y = metadataQuerier.GetDoubleEntry(
              metadata,
              "i3s-scale_y"
            );
          } else if (entryName === "i3s-attribute-type") {
            attributei3sName = metadataQuerier.GetStringEntry(
              metadata,
              "i3s-attribute-type"
            );
          }
        }
      }
      if (defined_default(decodedGeometry[attributei3sName])) {
        console.log("Attribute already exists", attributei3sName);
      }
      decodedGeometry[attributei3sName] = attributeData;
      if (attributei3sName === "feature-index") {
        decodedGeometry.featureCount++;
      }
    }
    dracoDecoderModule.destroy(dracoGeometry);
  }
  dracoDecoderModule.destroy(metadataQuerier);
  dracoDecoderModule.destroy(dracoDecoder);
  return decodedGeometry;
}
function decodeDracoAttribute(dracoDecoderModule, dracoDecoder, dracoGeometry, dracoAttribute, vertexCount) {
  const bufferSize = dracoAttribute.num_components() * vertexCount;
  let dracoAttributeData;
  const handlers = [
    function() {
    },
    // DT_INVALID - 0
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoInt8Array(bufferSize);
      const success = dracoDecoder.GetAttributeInt8ForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Int8Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    },
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoInt8Array(bufferSize);
      const success = dracoDecoder.GetAttributeUInt8ForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Uint8Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    },
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoInt16Array(bufferSize);
      const success = dracoDecoder.GetAttributeInt16ForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Int16Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    },
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoInt16Array(bufferSize);
      const success = dracoDecoder.GetAttributeUInt16ForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Uint16Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    },
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoInt32Array(bufferSize);
      const success = dracoDecoder.GetAttributeInt32ForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Int32Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    },
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoInt32Array(bufferSize);
      const success = dracoDecoder.GetAttributeUInt32ForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Uint32Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    },
    function() {
    },
    function() {
    },
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoFloat32Array(bufferSize);
      const success = dracoDecoder.GetAttributeFloatForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Float32Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    },
    function() {
    },
    function() {
      dracoAttributeData = new dracoDecoderModule.DracoUInt8Array(bufferSize);
      const success = dracoDecoder.GetAttributeUInt8ForAllPoints(
        dracoGeometry,
        dracoAttribute,
        dracoAttributeData
      );
      if (!success) {
        console.error("Bad stream");
      }
      const attributeData2 = new Uint8Array(bufferSize);
      for (let i = 0; i < bufferSize; ++i) {
        attributeData2[i] = dracoAttributeData.GetValue(i);
      }
      return attributeData2;
    }
  ];
  const attributeData = handlers[dracoAttribute.data_type()]();
  if (defined_default(dracoAttributeData)) {
    dracoDecoderModule.destroy(dracoAttributeData);
  }
  return attributeData;
}
var binaryAttributeDecoders = {
  position: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.vertexCount * 3;
    decodedGeometry.positions = new Float32Array(data, offset, count);
    offset += count * 4;
    return offset;
  },
  normal: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.vertexCount * 3;
    decodedGeometry.normals = new Float32Array(data, offset, count);
    offset += count * 4;
    return offset;
  },
  uv0: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.vertexCount * 2;
    decodedGeometry.uv0s = new Float32Array(data, offset, count);
    offset += count * 4;
    return offset;
  },
  color: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.vertexCount * 4;
    decodedGeometry.colors = new Uint8Array(data, offset, count);
    offset += count;
    return offset;
  },
  featureId: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.featureCount;
    offset += count * 8;
    return offset;
  },
  id: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.featureCount;
    offset += count * 8;
    return offset;
  },
  faceRange: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.featureCount * 2;
    decodedGeometry.faceRange = new Uint32Array(data, offset, count);
    offset += count * 4;
    return offset;
  },
  uvRegion: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.vertexCount * 4;
    decodedGeometry["uv-region"] = new Uint16Array(data, offset, count);
    offset += count * 2;
    return offset;
  },
  region: function(decodedGeometry, data, offset) {
    const count = decodedGeometry.vertexCount * 4;
    decodedGeometry["uv-region"] = new Uint16Array(data, offset, count);
    offset += count * 2;
    return offset;
  }
};
function decodeBinaryGeometry(data, schema, bufferInfo, featureData) {
  const decodedGeometry = {
    vertexCount: 0
  };
  const dataView = new DataView(data);
  try {
    let offset = 0;
    decodedGeometry.vertexCount = dataView.getUint32(offset, 1);
    offset += 4;
    decodedGeometry.featureCount = dataView.getUint32(offset, 1);
    offset += 4;
    if (defined_default(bufferInfo)) {
      for (let attrIndex = 0; attrIndex < bufferInfo.attributes.length; attrIndex++) {
        if (defined_default(binaryAttributeDecoders[bufferInfo.attributes[attrIndex]])) {
          offset = binaryAttributeDecoders[bufferInfo.attributes[attrIndex]](
            decodedGeometry,
            data,
            offset
          );
        } else {
          console.error(
            "Unknown decoder for",
            bufferInfo.attributes[attrIndex]
          );
        }
      }
    } else {
      let ordering = schema.ordering;
      let featureAttributeOrder = schema.featureAttributeOrder;
      if (defined_default(featureData) && defined_default(featureData.geometryData) && defined_default(featureData.geometryData[0]) && defined_default(featureData.geometryData[0].params)) {
        ordering = Object.keys(
          featureData.geometryData[0].params.vertexAttributes
        );
        featureAttributeOrder = Object.keys(
          featureData.geometryData[0].params.featureAttributes
        );
      }
      for (let i = 0; i < ordering.length; i++) {
        const decoder = binaryAttributeDecoders[ordering[i]];
        offset = decoder(decodedGeometry, data, offset);
      }
      for (let j = 0; j < featureAttributeOrder.length; j++) {
        const curDecoder = binaryAttributeDecoders[featureAttributeOrder[j]];
        offset = curDecoder(decodedGeometry, data, offset);
      }
    }
  } catch (e) {
    console.error(e);
  }
  decodedGeometry.scale_x = 1;
  decodedGeometry.scale_y = 1;
  return decodedGeometry;
}
function decodeAndCreateGltf(parameters) {
  const geometryData = decode(
    parameters.binaryData,
    parameters.schema,
    parameters.bufferInfo,
    parameters.featureData
  );
  if (defined_default(parameters.geoidDataList) && parameters.geoidDataList.length > 0) {
    orthometricToEllipsoidal(
      geometryData.vertexCount,
      geometryData.positions,
      geometryData.scale_x,
      geometryData.scale_y,
      parameters.cartographicCenter,
      parameters.geoidDataList,
      false
    );
  }
  transformToLocal(
    geometryData.vertexCount,
    geometryData.positions,
    geometryData.normals,
    parameters.cartographicCenter,
    parameters.cartesianCenter,
    parameters.parentRotation,
    parameters.ellipsoidRadiiSquare,
    geometryData.scale_x,
    geometryData.scale_y
  );
  if (defined_default(geometryData.uv0s) && defined_default(geometryData["uv-region"])) {
    cropUVs(
      geometryData.vertexCount,
      geometryData.uv0s,
      geometryData["uv-region"]
    );
  }
  let featureIndex;
  if (defined_default(geometryData["feature-index"])) {
    featureIndex = geometryData["feature-index"];
  } else if (defined_default(geometryData["faceRange"])) {
    featureIndex = new Array(geometryData.vertexCount);
    for (let range = 0; range < geometryData["faceRange"].length - 1; range += 2) {
      const curIndex = range / 2;
      const rangeStart = geometryData["faceRange"][range];
      const rangeEnd = geometryData["faceRange"][range + 1];
      for (let i = rangeStart; i <= rangeEnd; i++) {
        featureIndex[i * 3] = curIndex;
        featureIndex[i * 3 + 1] = curIndex;
        featureIndex[i * 3 + 2] = curIndex;
      }
    }
  }
  if (parameters.calculateNormals) {
    const data = generateNormals(
      geometryData.vertexCount,
      geometryData.indices,
      geometryData.positions,
      geometryData.normals,
      geometryData.uv0s,
      geometryData.colors,
      featureIndex
    );
    if (defined_default(data.normals)) {
      geometryData.normals = data.normals;
      if (defined_default(data.vertexCount)) {
        geometryData.vertexCount = data.vertexCount;
        geometryData.indices = data.indices;
        geometryData.positions = data.positions;
        geometryData.uv0s = data.uv0s;
        geometryData.colors = data.colors;
        featureIndex = data.featureIndex;
      }
    }
  }
  const meshData = generateGltfBuffer(
    geometryData.vertexCount,
    geometryData.indices,
    geometryData.positions,
    geometryData.normals,
    geometryData.uv0s,
    geometryData.colors,
    featureIndex,
    parameters
  );
  const customAttributes = {
    positions: geometryData.positions,
    indices: geometryData.indices,
    featureIndex,
    sourceURL: parameters.url,
    cartesianCenter: parameters.cartesianCenter,
    parentRotation: parameters.parentRotation
  };
  meshData._customAttributes = customAttributes;
  const results = {
    meshData
  };
  return results;
}
async function initWorker(parameters, transferableObjects) {
  const wasmConfig = parameters.webAssemblyConfig;
  if (defined_default(wasmConfig) && defined_default(wasmConfig.wasmBinaryFile)) {
    draco = await (0, import_draco_decoder_nodejs.default)(wasmConfig);
  } else {
    draco = await (0, import_draco_decoder_nodejs.default)();
  }
  return true;
}
function decodeI3S(parameters, transferableObjects) {
  const wasmConfig = parameters.webAssemblyConfig;
  if (defined_default(wasmConfig)) {
    return initWorker(parameters, transferableObjects);
  }
  return decodeAndCreateGltf(parameters, transferableObjects);
}
var decodeI3S_default = createTaskProcessorWorker_default(decodeI3S);
export {
  decodeI3S_default as default
};
