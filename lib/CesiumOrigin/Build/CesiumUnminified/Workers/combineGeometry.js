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
  PrimitivePipeline_default
} from "./chunk-JKWSZV7V.js";
import {
  createTaskProcessorWorker_default
} from "./chunk-FBQPT4P3.js";
import "./chunk-ZFQZCRL5.js";
import "./chunk-CY3OVWLV.js";
import "./chunk-ICIKVL3Z.js";
import "./chunk-MDCLZ7QP.js";
import "./chunk-ACTT2WMN.js";
import "./chunk-VG5Y7W34.js";
import "./chunk-GTGRT4O2.js";
import "./chunk-G35EMRL3.js";
import "./chunk-FKSNUK75.js";
import "./chunk-2HZPXDX2.js";
import "./chunk-IBAVIVJ3.js";
import "./chunk-IZN72LSC.js";
import "./chunk-XK45PQUB.js";
import "./chunk-YVLPEBIG.js";
import "./chunk-2DV2K5ZE.js";
import "./chunk-XESAYCGT.js";
import "./chunk-HGPEZFC4.js";
import "./chunk-HGSHOKKT.js";

// packages/engine/Source/Workers/combineGeometry.js
function combineGeometry(packedParameters, transferableObjects) {
  const parameters = PrimitivePipeline_default.unpackCombineGeometryParameters(packedParameters);
  const results = PrimitivePipeline_default.combineGeometry(parameters);
  return PrimitivePipeline_default.packCombineGeometryResults(
    results,
    transferableObjects
  );
}
var combineGeometry_default = createTaskProcessorWorker_default(combineGeometry);
export {
  combineGeometry_default as default
};
