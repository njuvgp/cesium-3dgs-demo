# cesium-3dgs-demo
基于Cesium实现的3DGS渲染，基于Cesium v1.131实现<br>
## 项目说明
./lib:Cesium开发库<br>
./css:样式文件<br>
./js:Javascript 代码<br>
./index.html: 项目入口文件<br>
## 项目启动方法
1.将自己的3DGS数据利用第三方工具（GISBox或CesiumLab）切片为3DTiles 1.1格式后，存放于./data/文件夹下。<br>
2.使用Web服务器（Tomcat、Windows IIS等）托管该项目，然后浏览器访问index.html文件即可。<br>

## 目前已知问题
1.暂不支持高阶球谐函数；<br>

## 未来计划
1. 完成3DGS点云的光照、阴影、重光照处理。<br>
2. 完成3DGS模型的风格化。<br>
