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
  BoundingRectangle_default
} from "./chunk-XWTNLJQI.js";
import {
  CornerType_default,
  PolylineVolumeGeometryLibrary_default
} from "./chunk-2OJG2C2I.js";
import "./chunk-UVUMDJNM.js";
import "./chunk-QQAN6G6A.js";
import "./chunk-JSMA2QKN.js";
import "./chunk-73N3S6T6.js";
import {
  PolygonPipeline_default,
  WindingOrder_default
} from "./chunk-QA54XQVG.js";
import {
  arrayRemoveDuplicates_default
} from "./chunk-WE4WTMCS.js";
import "./chunk-2UB2QVY4.js";
import "./chunk-LOBXP5UY.js";
import "./chunk-NY74JXQ5.js";
import {
  IndexDatatype_default
} from "./chunk-HWIXMKBA.js";
import {
  GeometryAttributes_default
} from "./chunk-KWBBQWF2.js";
import {
  GeometryAttribute_default,
  Geometry_default,
  PrimitiveType_default
} from "./chunk-6HBCHN3S.js";
import {
  BoundingSphere_default
} from "./chunk-3ERIXU2W.js";
import "./chunk-2UWVB4NL.js";
import {
  ComponentDatatype_default
} from "./chunk-T2ESMZCL.js";
import {
  Cartesian2_default,
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-4SN33TQR.js";
import {
  Math_default
} from "./chunk-CZ4RC7BS.js";
import "./chunk-WKBHOKFD.js";
import "./chunk-BYPRNUCO.js";
import {
  defaultValue_default
} from "./chunk-SGH7UNZN.js";
import {
  DeveloperError_default
} from "./chunk-N2TV4RJQ.js";
import {
  defined_default
} from "./chunk-6MI7ARVC.js";

// packages/engine/Source/Core/PolylineVolumeOutlineGeometry.js
function computeAttributes(positions, shape) {
  const attributes = new GeometryAttributes_default();
  attributes.position = new GeometryAttribute_default({
    componentDatatype: ComponentDatatype_default.DOUBLE,
    componentsPerAttribute: 3,
    values: positions
  });
  const shapeLength = shape.length;
  const vertexCount = attributes.position.values.length / 3;
  const positionLength = positions.length / 3;
  const shapeCount = positionLength / shapeLength;
  const indices = IndexDatatype_default.createTypedArray(
    vertexCount,
    2 * shapeLength * (shapeCount + 1)
  );
  let i, j;
  let index = 0;
  i = 0;
  let offset = i * shapeLength;
  for (j = 0; j < shapeLength - 1; j++) {
    indices[index++] = j + offset;
    indices[index++] = j + offset + 1;
  }
  indices[index++] = shapeLength - 1 + offset;
  indices[index++] = offset;
  i = shapeCount - 1;
  offset = i * shapeLength;
  for (j = 0; j < shapeLength - 1; j++) {
    indices[index++] = j + offset;
    indices[index++] = j + offset + 1;
  }
  indices[index++] = shapeLength - 1 + offset;
  indices[index++] = offset;
  for (i = 0; i < shapeCount - 1; i++) {
    const firstOffset = shapeLength * i;
    const secondOffset = firstOffset + shapeLength;
    for (j = 0; j < shapeLength; j++) {
      indices[index++] = j + firstOffset;
      indices[index++] = j + secondOffset;
    }
  }
  const geometry = new Geometry_default({
    attributes,
    indices: IndexDatatype_default.createTypedArray(vertexCount, indices),
    boundingSphere: BoundingSphere_default.fromVertices(positions),
    primitiveType: PrimitiveType_default.LINES
  });
  return geometry;
}
function PolylineVolumeOutlineGeometry(options) {
  options = defaultValue_default(options, defaultValue_default.EMPTY_OBJECT);
  const positions = options.polylinePositions;
  const shape = options.shapePositions;
  if (!defined_default(positions)) {
    throw new DeveloperError_default("options.polylinePositions is required.");
  }
  if (!defined_default(shape)) {
    throw new DeveloperError_default("options.shapePositions is required.");
  }
  this._positions = positions;
  this._shape = shape;
  this._ellipsoid = Ellipsoid_default.clone(
    defaultValue_default(options.ellipsoid, Ellipsoid_default.default)
  );
  this._cornerType = defaultValue_default(options.cornerType, CornerType_default.ROUNDED);
  this._granularity = defaultValue_default(
    options.granularity,
    Math_default.RADIANS_PER_DEGREE
  );
  this._workerName = "createPolylineVolumeOutlineGeometry";
  let numComponents = 1 + positions.length * Cartesian3_default.packedLength;
  numComponents += 1 + shape.length * Cartesian2_default.packedLength;
  this.packedLength = numComponents + Ellipsoid_default.packedLength + 2;
}
PolylineVolumeOutlineGeometry.pack = function(value, array, startingIndex) {
  if (!defined_default(value)) {
    throw new DeveloperError_default("value is required");
  }
  if (!defined_default(array)) {
    throw new DeveloperError_default("array is required");
  }
  startingIndex = defaultValue_default(startingIndex, 0);
  let i;
  const positions = value._positions;
  let length = positions.length;
  array[startingIndex++] = length;
  for (i = 0; i < length; ++i, startingIndex += Cartesian3_default.packedLength) {
    Cartesian3_default.pack(positions[i], array, startingIndex);
  }
  const shape = value._shape;
  length = shape.length;
  array[startingIndex++] = length;
  for (i = 0; i < length; ++i, startingIndex += Cartesian2_default.packedLength) {
    Cartesian2_default.pack(shape[i], array, startingIndex);
  }
  Ellipsoid_default.pack(value._ellipsoid, array, startingIndex);
  startingIndex += Ellipsoid_default.packedLength;
  array[startingIndex++] = value._cornerType;
  array[startingIndex] = value._granularity;
  return array;
};
var scratchEllipsoid = Ellipsoid_default.clone(Ellipsoid_default.UNIT_SPHERE);
var scratchOptions = {
  polylinePositions: void 0,
  shapePositions: void 0,
  ellipsoid: scratchEllipsoid,
  height: void 0,
  cornerType: void 0,
  granularity: void 0
};
PolylineVolumeOutlineGeometry.unpack = function(array, startingIndex, result) {
  if (!defined_default(array)) {
    throw new DeveloperError_default("array is required");
  }
  startingIndex = defaultValue_default(startingIndex, 0);
  let i;
  let length = array[startingIndex++];
  const positions = new Array(length);
  for (i = 0; i < length; ++i, startingIndex += Cartesian3_default.packedLength) {
    positions[i] = Cartesian3_default.unpack(array, startingIndex);
  }
  length = array[startingIndex++];
  const shape = new Array(length);
  for (i = 0; i < length; ++i, startingIndex += Cartesian2_default.packedLength) {
    shape[i] = Cartesian2_default.unpack(array, startingIndex);
  }
  const ellipsoid = Ellipsoid_default.unpack(array, startingIndex, scratchEllipsoid);
  startingIndex += Ellipsoid_default.packedLength;
  const cornerType = array[startingIndex++];
  const granularity = array[startingIndex];
  if (!defined_default(result)) {
    scratchOptions.polylinePositions = positions;
    scratchOptions.shapePositions = shape;
    scratchOptions.cornerType = cornerType;
    scratchOptions.granularity = granularity;
    return new PolylineVolumeOutlineGeometry(scratchOptions);
  }
  result._positions = positions;
  result._shape = shape;
  result._ellipsoid = Ellipsoid_default.clone(ellipsoid, result._ellipsoid);
  result._cornerType = cornerType;
  result._granularity = granularity;
  return result;
};
var brScratch = new BoundingRectangle_default();
PolylineVolumeOutlineGeometry.createGeometry = function(polylineVolumeOutlineGeometry) {
  const positions = polylineVolumeOutlineGeometry._positions;
  const cleanPositions = arrayRemoveDuplicates_default(
    positions,
    Cartesian3_default.equalsEpsilon
  );
  let shape2D = polylineVolumeOutlineGeometry._shape;
  shape2D = PolylineVolumeGeometryLibrary_default.removeDuplicatesFromShape(shape2D);
  if (cleanPositions.length < 2 || shape2D.length < 3) {
    return void 0;
  }
  if (PolygonPipeline_default.computeWindingOrder2D(shape2D) === WindingOrder_default.CLOCKWISE) {
    shape2D.reverse();
  }
  const boundingRectangle = BoundingRectangle_default.fromPoints(shape2D, brScratch);
  const computedPositions = PolylineVolumeGeometryLibrary_default.computePositions(
    cleanPositions,
    shape2D,
    boundingRectangle,
    polylineVolumeOutlineGeometry,
    false
  );
  return computeAttributes(computedPositions, shape2D);
};
var PolylineVolumeOutlineGeometry_default = PolylineVolumeOutlineGeometry;

// packages/engine/Source/Workers/createPolylineVolumeOutlineGeometry.js
function createPolylineVolumeOutlineGeometry(polylineVolumeOutlineGeometry, offset) {
  if (defined_default(offset)) {
    polylineVolumeOutlineGeometry = PolylineVolumeOutlineGeometry_default.unpack(
      polylineVolumeOutlineGeometry,
      offset
    );
  }
  polylineVolumeOutlineGeometry._ellipsoid = Ellipsoid_default.clone(
    polylineVolumeOutlineGeometry._ellipsoid
  );
  return PolylineVolumeOutlineGeometry_default.createGeometry(
    polylineVolumeOutlineGeometry
  );
}
var createPolylineVolumeOutlineGeometry_default = createPolylineVolumeOutlineGeometry;
export {
  createPolylineVolumeOutlineGeometry_default as default
};
