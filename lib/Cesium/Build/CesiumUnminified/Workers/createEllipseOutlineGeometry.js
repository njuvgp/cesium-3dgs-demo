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
  EllipseOutlineGeometry_default
} from "./chunk-BTYVEM66.js";
import "./chunk-X4PFQSUZ.js";
import "./chunk-KGK6CWUW.js";
import "./chunk-HWIXMKBA.js";
import "./chunk-KWBBQWF2.js";
import "./chunk-6HBCHN3S.js";
import "./chunk-3ERIXU2W.js";
import "./chunk-2UWVB4NL.js";
import "./chunk-T2ESMZCL.js";
import {
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-4SN33TQR.js";
import "./chunk-CZ4RC7BS.js";
import "./chunk-WKBHOKFD.js";
import "./chunk-BYPRNUCO.js";
import "./chunk-SGH7UNZN.js";
import "./chunk-N2TV4RJQ.js";
import {
  defined_default
} from "./chunk-6MI7ARVC.js";

// packages/engine/Source/Workers/createEllipseOutlineGeometry.js
function createEllipseOutlineGeometry(ellipseGeometry, offset) {
  if (defined_default(offset)) {
    ellipseGeometry = EllipseOutlineGeometry_default.unpack(ellipseGeometry, offset);
  }
  ellipseGeometry._center = Cartesian3_default.clone(ellipseGeometry._center);
  ellipseGeometry._ellipsoid = Ellipsoid_default.clone(ellipseGeometry._ellipsoid);
  return EllipseOutlineGeometry_default.createGeometry(ellipseGeometry);
}
var createEllipseOutlineGeometry_default = createEllipseOutlineGeometry;
export {
  createEllipseOutlineGeometry_default as default
};
