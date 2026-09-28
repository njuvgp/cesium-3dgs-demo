/*
 * RawPlyGaussianSplatLoader
 *
 * Standalone helper for loading raw binary_little_endian 3DGS PLY files into
 * CesiumJS without converting them to 3D Tiles first.
 *
 * Usage with an unmodified CesiumJS build:
 *
 *   <script src="Build/CesiumUnminified/Cesium.js"></script>
 *   <script src="RawPlyGaussianSplatLoader.js"></script>
 *
 *   const primitive = await RawPlyGaussianSplatLoader.fromUrl({
 *     url: "model.ply",
 *     longitude: 116.391,
 *     latitude: 39.907,
 *     height: 60,
 *     onProgress(progress) {
 *       console.log(progress.stage, progress.percent, progress.message);
 *     },
 *   });
 *   viewer.scene.primitives.add(primitive);
 *
 * Coordinate mapping:
 *   PLY +X = local East meters
 *   PLY +Y = local North meters
 *   PLY +Z = local Up meters
 *
 * This file intentionally does not require the Cesium source changes used by
 * the sliced GLB demo. It reuses Cesium's existing GaussianSplatPrimitive by
 * creating a small in-memory adapter around the parsed PLY attributes.
 */
/* global Cesium */
(function () {
  "use strict";

  const SH_C0 = 0.28209479177387814;

  function defined(value) {
    return value !== undefined && value !== null;
  }

  function sigmoid(value) {
    return 1.0 / (1.0 + Math.exp(-value));
  }

  function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(value * 255.0)));
  }

  function report(progressCallback, stage, loaded, total, message) {
    if (typeof progressCallback !== "function") {
      return;
    }

    progressCallback({
      stage: stage,
      loaded: loaded,
      total: total,
      percent: total > 0 ? loaded / total : undefined,
      message: message,
    });
  }

  async function fetchArrayBuffer(url, progressCallback) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    }

    const total = Number(response.headers.get("content-length") ?? 0);
    if (!defined(response.body)) {
      report(progressCallback, "download", 0, total, "Downloading PLY...");
      const arrayBuffer = await response.arrayBuffer();
      report(
        progressCallback,
        "download",
        arrayBuffer.byteLength,
        arrayBuffer.byteLength,
        "PLY download complete.",
      );
      return arrayBuffer;
    }

    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;

    for (;;) {
      const result = await reader.read();
      if (result.done) {
        break;
      }

      chunks.push(result.value);
      loaded += result.value.byteLength;
      report(progressCallback, "download", loaded, total, "Downloading PLY...");
    }

    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    report(progressCallback, "download", loaded, total || loaded, "PLY download complete.");
    return bytes.buffer;
  }

  function parseHeader(text) {
    const endHeader = text.indexOf("end_header");
    if (endHeader < 0) {
      throw new Error("PLY header is incomplete.");
    }

    const header = text.slice(0, endHeader + "end_header".length);
    if (!header.startsWith("ply")) {
      throw new Error("The file is not a PLY file.");
    }
    if (!header.includes("format binary_little_endian 1.0")) {
      throw new Error("Only binary_little_endian PLY files are supported.");
    }

    const lines = header.split(/\r?\n/);
    const vertexLine = lines.find((line) => line.startsWith("element vertex "));
    const vertexCount = Number(vertexLine?.split(/\s+/)[2]);
    if (!Number.isFinite(vertexCount) || vertexCount <= 0) {
      throw new Error("PLY header does not contain a valid vertex count.");
    }

    const properties = [];
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts[0] === "property" && parts[1] === "float") {
        properties.push(parts[2]);
      }
    }

    return {
      headerLength: endHeader + "end_header".length + 1,
      vertexCount: vertexCount,
      properties: properties,
    };
  }

  function requireProperty(properties, name) {
    const index = properties.indexOf(name);
    if (index < 0) {
      throw new Error(`PLY is missing property ${name}.`);
    }
    return index;
  }

  function parsePly(arrayBuffer, progressCallback) {
    report(progressCallback, "parse", 0, 1, "Reading PLY header...");

    const headerText = new TextDecoder("utf-8").decode(
      new Uint8Array(arrayBuffer, 0, Math.min(arrayBuffer.byteLength, 16384)),
    );
    const header = parseHeader(headerText);
    const properties = header.properties;
    const stride = properties.length;
    const dataBuffer = arrayBuffer.slice(header.headerLength);
    const data = new Float32Array(dataBuffer, 0, header.vertexCount * stride);

    const ix = requireProperty(properties, "x");
    const iy = requireProperty(properties, "y");
    const iz = requireProperty(properties, "z");
    const irot0 = requireProperty(properties, "rot_0");
    const irot1 = requireProperty(properties, "rot_1");
    const irot2 = requireProperty(properties, "rot_2");
    const irot3 = requireProperty(properties, "rot_3");
    const iscale0 = requireProperty(properties, "scale_0");
    const iscale1 = requireProperty(properties, "scale_1");
    const iscale2 = requireProperty(properties, "scale_2");
    const iopacity = requireProperty(properties, "opacity");
    const ifdc0 = requireProperty(properties, "f_dc_0");
    const ifdc1 = requireProperty(properties, "f_dc_1");
    const ifdc2 = requireProperty(properties, "f_dc_2");

    const positions = new Float32Array(header.vertexCount * 3);
    const rotations = new Float32Array(header.vertexCount * 4);
    const scales = new Float32Array(header.vertexCount * 3);
    const colors = new Uint8Array(header.vertexCount * 4);

    const reportStep = Math.max(1, Math.floor(header.vertexCount / 100));
    for (let i = 0; i < header.vertexCount; i++) {
      const src = i * stride;
      const p = i * 3;
      const q = i * 4;

      positions[p] = data[src + ix];
      positions[p + 1] = data[src + iy];
      positions[p + 2] = data[src + iz];

      // 3DGS PLY stores quaternions as w, x, y, z. Cesium Quaternion uses x, y, z, w.
      rotations[q] = data[src + irot1];
      rotations[q + 1] = data[src + irot2];
      rotations[q + 2] = data[src + irot3];
      rotations[q + 3] = data[src + irot0];

      scales[p] = Math.exp(data[src + iscale0]);
      scales[p + 1] = Math.exp(data[src + iscale1]);
      scales[p + 2] = Math.exp(data[src + iscale2]);

      colors[q] = clampByte(0.5 + SH_C0 * data[src + ifdc0]);
      colors[q + 1] = clampByte(0.5 + SH_C0 * data[src + ifdc1]);
      colors[q + 2] = clampByte(0.5 + SH_C0 * data[src + ifdc2]);
      colors[q + 3] = clampByte(sigmoid(data[src + iopacity]));

      if (i % reportStep === 0) {
        report(progressCallback, "parse", i, header.vertexCount, "Parsing PLY splats...");
      }
    }

    report(
      progressCallback,
      "parse",
      header.vertexCount,
      header.vertexCount,
      "PLY parse complete.",
    );

    return {
      vertexCount: header.vertexCount,
      positions: positions,
      rotations: rotations,
      scales: scales,
      colors: colors,
    };
  }

  function createRawPlyTileset(origin, ply) {
    const content = {
      gltfPrimitive: {
        attributes: [
          {
            name: "POSITION",
            semantic: "POSITION",
            type: "VEC3",
            typedArray: ply.positions,
          },
          {
            name: "_ROTATION",
            semantic: "KHR_gaussian_splatting:ROTATION",
            type: "VEC4",
            typedArray: ply.rotations,
          },
          {
            name: "_SCALE",
            semantic: "KHR_gaussian_splatting:SCALE",
            type: "VEC3",
            typedArray: ply.scales,
          },
          {
            name: "COLOR_0",
            semantic: "COLOR",
            setIndex: 0,
            type: "VEC4",
            typedArray: ply.colors,
          },
        ],
      },
      positions: ply.positions,
      rotations: ply.rotations,
      scales: ply.scales,
      sphericalHarmonicsDegree: 0,
      sphericalHarmonicsCoefficientCount: 0,
      packedSphericalHarmonicsData: undefined,
      pointsLength: ply.vertexCount,
      worldTransform: Cesium.Matrix4.IDENTITY,
      _transformed: false,
      _lastSplatTransform: undefined,
    };

    const tile = {
      content: content,
      computedTransform: Cesium.Matrix4.IDENTITY,
      tileset: undefined,
    };

    const tileset = {
      show: true,
      _selectedTiles: [tile],
      _modelMatrixChanged: false,
      modelMatrix: Cesium.Matrix4.IDENTITY,
      maximumScreenSpaceError: 16,
      splitDirection: Cesium.SplitDirection.NONE,
      boundingSphere: new Cesium.BoundingSphere(origin, 40.0),
      tileLoad: new Cesium.Event(),
      tileVisible: new Cesium.Event(),
      update: function () {},
    };

    tile.tileset = tileset;
    return tileset;
  }

  async function fromUrl(options) {
    if (!defined(window.Cesium)) {
      throw new Error("Cesium must be loaded before RawPlyGaussianSplatLoader.js.");
    }
    if (!defined(Cesium.GaussianSplatPrimitive)) {
      throw new Error(
        "This Cesium build does not expose Cesium.GaussianSplatPrimitive.",
      );
    }
    if (!defined(options) || !defined(options.url)) {
      throw new Error("RawPlyGaussianSplatLoader.fromUrl requires options.url.");
    }

    const progressCallback = options.onProgress;
    const longitude = options.longitude ?? 0.0;
    const latitude = options.latitude ?? 0.0;
    const height = options.height ?? 0.0;

    report(progressCallback, "start", 0, 1, "Starting raw PLY 3DGS load...");
    const arrayBuffer = await fetchArrayBuffer(options.url, progressCallback);
    const ply = parsePly(arrayBuffer, progressCallback);

    const origin = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
    const enuTransform = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
    const rawTileset = createRawPlyTileset(origin, ply);
    const primitive = new Cesium.GaussianSplatPrimitive({
      tileset: rawTileset,
    });
    rawTileset.gaussianSplatPrimitive = primitive;

    // GaussianSplatPrimitive applies its normal glTF axis correction before
    // worldTransform. Pre-multiply by the inverse so PLY x/y/z remain ENU meters.
    const inverseAxis = Cesium.Matrix4.inverse(
      primitive._axisCorrectionMatrix,
      new Cesium.Matrix4(),
    );
    rawTileset._selectedTiles[0].content.worldTransform =
      Cesium.Matrix4.multiplyTransformation(
        inverseAxis,
        enuTransform,
        new Cesium.Matrix4(),
      );

    primitive.rawPlyGaussianSplatInfo = {
      url: options.url,
      splatCount: ply.vertexCount,
      longitude: longitude,
      latitude: latitude,
      height: height,
      coordinateMapping: {
        x: "east meters",
        y: "north meters",
        z: "up meters",
      },
      origin: origin,
      enuTransform: enuTransform,
      tileset: rawTileset,
    };

    report(progressCallback, "ready", 1, 1, "Raw PLY 3DGS primitive is ready.");
    return primitive;
  }

  window.RawPlyGaussianSplatLoader = {
    fromUrl: fromUrl,
    parsePly: parsePly,
  };
})();
