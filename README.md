# cesium-3dgs-demo v2.0

本项目由南京大学地理与海洋科学学院虚拟地理环境实验室研究生刘名扬根据实际应用需求探索和开发，旨在基于 Cesium 实现 3D Gaussian Splatting 数据的原生加载与可视化。

v1.0 版本基于 Cesium v1.125 对 3DGS shader 进行了改进，在色彩还原和结构完整性方面取得了较好的显示效果。随着 Cesium 官方在后续版本中逐步加入 3DGS 支持，v2.0 版本进一步调整实现方式：基于 Cesium v1.145，直接解析原始 PLY 文件并构建 `GaussianSplatPrimitive`，从而绕过 3D Tiles 切片、加载和解析流程，实现对原生 3DGS PLY 数据的直接展示。

南京大学地理与海洋科学学院虚拟地理环境实验室长期专注于虚拟地理场景的模拟与分析研究，主要研究方向涵盖地理信息三维可视化、时空数据建模与分析，以及人工智能与 GIS 技术的融合应用。实验室注重理论与实践相结合，已承担多个 GIS 专题应用系统研发任务，相关成果已在多个领域得到实际应用。

## 演示视频

[demo.mp4](./demo.mp4)

如果在当前平台中无法直接播放视频，可以下载或打开项目根目录下的 `demo.mp4` 查看运行效果。

## 更新日志

- 2026.09.28：发布 v2.0。基于 Cesium v1.145 重写 PLY 加载流程，支持无需切片直接加载原生 3DGS PLY 文件。
- 2025.10.12：发布 v1.0。基于 Cesium v1.125 改进 3DGS shader，实现更好的视觉表现。

## 项目特性

- 支持直接加载原生 3DGS PLY 文件。
- 无需先将 3DGS 数据切片为 3D Tiles。
- 基于 Cesium `GaussianSplatPrimitive` 构建渲染对象。
- 支持设置 PLY 数据在地理空间中的经度、纬度和高度。
- 示例程序可通过普通本地 Web 服务直接运行。

## 项目结构

```text
.
├── App/
│   ├── Cesium.js
│   ├── RawPly3DGSDemo.html
│   ├── RawPlyGaussianSplatLoader.js
│   ├── ThirdParty/
│   │   └── wasm_splats_bg.wasm
│   └── widgets.css
├── demo.mp4
├── demo.ply
└── README.md
```

其中：

- `App/RawPly3DGSDemo.html`：示例页面入口。
- `App/RawPlyGaussianSplatLoader.js`：原生 PLY 加载与解析逻辑。
- `App/Cesium.js`：Cesium 构建文件。
- `App/ThirdParty/wasm_splats_bg.wasm`：Cesium 3DGS 渲染所需的 WASM 文件。
- `demo.mp4`：项目运行效果演示视频。
- `demo.ply`：示例 3DGS PLY 数据。

## 项目启动方法

请使用本地 Web 服务启动项目，不建议直接双击 HTML 文件运行。浏览器在 `file://` 协议下会限制 PLY、WASM 等资源加载，可能导致 Cesium 页面无法正常显示。

在项目根目录执行：

```powershell
python -m http.server 8080
```

然后在浏览器中访问：

```text
http://localhost:8080/App/RawPly3DGSDemo.html
```

如果 `8080` 端口已被占用，可以改用其他端口，例如：

```powershell
python -m http.server 5501
```

对应访问地址为：

```text
http://localhost:5501/App/RawPly3DGSDemo.html
```

## 在 Cesium 中集成

如果需要在 Cesium v1.145 源码或自定义 Cesium 构建中集成本项目的原生 PLY 加载能力，可以将 `App/RawPlyGaussianSplatLoader.js` 放到页面可访问的位置，并在加载 Cesium 后引入：

```html
<script src="./Cesium.js"></script>
<script src="./RawPlyGaussianSplatLoader.js"></script>
```

然后通过 `RawPlyGaussianSplatLoader.fromUrl` 加载 PLY 文件：

```html
<div id="cesiumContainer"></div>
<script>
  const viewer = new Cesium.Viewer("cesiumContainer", {
    animation: false,
    baseLayer: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
  });

  const primitive = await RawPlyGaussianSplatLoader.fromUrl({
    url: "../demo.ply",
    longitude: 116.391,
    latitude: 39.907,
    height: 5.0,
  });

  viewer.scene.primitives.add(primitive);
  viewer.camera.flyToBoundingSphere(
    primitive.rawPlyGaussianSplatInfo.tileset.boundingSphere,
    {
      offset: new Cesium.HeadingPitchRange(
        0.0,
        Cesium.Math.toRadians(-25.0),
        80.0,
      ),
    },
  );
</script>
```

需要注意的是，`Cesium.js` 在渲染 3DGS 时需要访问 `ThirdParty/wasm_splats_bg.wasm`。在本项目中，该文件位于 `App/ThirdParty/wasm_splats_bg.wasm`。如果移动 `Cesium.js` 或 HTML 页面目录，请同步调整 `ThirdParty` 目录位置，确保 WASM 文件能够被浏览器正确加载。

## 已知问题

暂无。

## 未来计划

1. 完成 3DGS 点云的光照、阴影与重光照处理。
2. 完成 3DGS 模型的风格化显示。
