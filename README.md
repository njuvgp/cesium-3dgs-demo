# cesium-3dgs-demo v2.0 
本项目由南京大学地理与海洋科学学院虚拟地理环境实验室研究生刘名扬根据实际应用需求探索和开发，基于Cesium实现原生的3DGS渲染，相比 Cesium v1.131 版本的内置实现，该方案在色彩逼真度与结构完整性方面表现更好。<br><br>
南京大学地理与海洋科学学院虚拟地理环境实验室长期专注于虚拟地理场景的模拟与分析研究，主要研究方向涵盖地理信息三维可视化、时空数据建模与分析、以及人工智能与 GIS 技术的融合应用。实验室注重理论与实践相结合，已承担多个 GIS 专题应用系统的研发任务，相关成果已在多个领域得到实际应用。<br>
## 更新日志 
2026.09.28: v2.0发布，在官方v1.145上重写ply的实现，无需切片即可直接加载ply文件。
## 项目说明
./App ： 实例程序<br>
## 项目启动方法
1. 使用本地 Web 服务启动项目。不要直接双击 HTML 文件运行，因为浏览器在 `file://` 协议下会限制 `demo.ply`、WASM 等资源加载，可能导致 Cesium 页面无法正常运行。<br>
   在项目根目录执行：<br>
   ```powershell
   python -m http.server 8080
   ```
   然后在浏览器中访问：<br>
   ```text
   http://localhost:8080/App/RawPly3DGSDemo.html
   ```
   如果 8080 端口被占用，可以更换端口，例如：<br>
   ```powershell
   python -m http.server 5501
   ```
   对应访问：`http://localhost:5501/App/RawPly3DGSDemo.html`。<br>

2. 在 Cesium v1.145 源码或自定义 Cesium 构建中集成本项目的原生 PLY 加载器。<br>
   将 `App/RawPlyGaussianSplatLoader.js` 放到你的 Cesium 示例页面可访问的位置，并在加载 Cesium 后引入该文件：<br>
   ```html
   <script src="./Cesium.js"></script>
   <script src="./RawPlyGaussianSplatLoader.js"></script>
   ```
   然后通过 `RawPlyGaussianSplatLoader.fromUrl` 直接加载 3DGS PLY 文件：<br>
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
   注意：`Cesium.js` 需要能够访问 `ThirdParty/wasm_splats_bg.wasm`。在本项目中该文件位于 `App/ThirdParty/wasm_splats_bg.wasm`，如果移动 `Cesium.js` 或页面目录，需要同步调整资源目录位置。<br>

## 目前已知问题
暂无

## 未来计划
1. 完成3DGS点云的光照、阴影、重光照处理。<br>
2. 完成3DGS模型的风格化。<br>


