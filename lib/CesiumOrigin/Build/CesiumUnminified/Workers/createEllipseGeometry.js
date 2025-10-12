/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.131
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
  EllipseGeometry_default
} from "./chunk-QUNBFSPG.js";
import "./chunk-QLOL33P7.js";
import "./chunk-EVEAPHPN.js";
import "./chunk-CY3OVWLV.js";
import "./chunk-ICIKVL3Z.js";
import "./chunk-MDCLZ7QP.js";
import "./chunk-SWKOJLGC.js";
import "./chunk-NPV27ZK4.js";
import "./chunk-ACTT2WMN.js";
import "./chunk-VG5Y7W34.js";
import "./chunk-GTGRT4O2.js";
import "./chunk-G35EMRL3.js";
import "./chunk-FKSNUK75.js";
import "./chunk-2HZPXDX2.js";
import "./chunk-IBAVIVJ3.js";
import "./chunk-IZN72LSC.js";
import {
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-XK45PQUB.js";
import "./chunk-YVLPEBIG.js";
import "./chunk-2DV2K5ZE.js";
import "./chunk-XESAYCGT.js";
import "./chunk-HGPEZFC4.js";
import {
  defined_default
} from "./chunk-HGSHOKKT.js";

// packages/engine/Source/Workers/createEllipseGeometry.js
function createEllipseGeometry(ellipseGeometry, offset) {
  if (defined_default(offset)) {
    ellipseGeometry = EllipseGeometry_default.unpack(ellipseGeometry, offset);
  }
  ellipseGeometry._center = Cartesian3_default.clone(ellipseGeometry._center);
  ellipseGeometry._ellipsoid = Ellipsoid_default.clone(ellipseGeometry._ellipsoid);
  return EllipseGeometry_default.createGeometry(ellipseGeometry);
}
var createEllipseGeometry_default = createEllipseGeometry;
export {
  createEllipseGeometry_default as default
};
