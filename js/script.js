Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZjVkN2E5OS01YjQyLTQ4NzAtYTQxNC0zZTFlMzdjOWIzMjYiLCJpZCI6NjkxMTgsImlhdCI6MTc0MDM4NzUyNH0.Too0rJ9vcM-LQePwaXxcgBwPZOP4ZRgvbx6R5Nv7gpA'

let myTileSet = null;
let buildingTileSetArr = new Array(9);
let treeTileSetArr = new Array(24);
let roofTileSetArr = new Array(9);
let tree013 = null;
let tree001 = null;
//利用translation对模型的经度、纬度、高度进行修改


let isIdentifyMode = false; // 控制是否处于单体化拾取模式


let highlightTile = null;
let highlightColor = Cesium.Color.YELLOW.withAlpha(0.6);

let roofOffset = [[0,0,0,0,0,0,0],
  [118.6908,32.1770,60,0.93,-7,-0.1,-28],

]


var viewer = new Cesium.Viewer("CesiumContainer",{
    terain:Cesium.Terrain.fromWorldTerrain()
});
viewer.scene.camera.frustum.near = 0.0001; 
var canvas = viewer.scene.canvas;
var ellipsoid = viewer.scene.globe.ellipsoid;

// 创建事件处理器
var handler = new Cesium.ScreenSpaceEventHandler(canvas);

// 设置鼠标移动事件的处理函数
handler.setInputAction(function (movement) {
// 获取鼠标位置对应的笛卡尔坐标
  var cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
  console.log(cartesian)
  if (cartesian) {
  // 将笛卡尔坐标转换为地理坐标（弧度）
  var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);

  // 将地理坐标（弧度）转换为十进制的度数
  var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4); // 纬度
  var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4); // 经度
  var altitude = (viewer.camera.positionCartographic.height / 1000).toFixed(2); // 高度

  // 输出经纬度和高度信息
  console.log('Latitude: ' + latitude + ', Longitude: ' + longitude + ', Altitude: ' + altitude);
  }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);



viewer.scene.globe.depthTestAgainstTerrain = false;
async function  init() {
    let tileset =await Cesium.Cesium3DTileset.fromUrl(
      "./data/resdata/out/tileset.json",  {
          //  maximumScreenSpaceError: 1, //决定精细度,同样的距离,值越小越精细
          //  skipLevels: 5,
          //  skipLevelOfDetail: true,  //让cesium在遍历请求tile.json的时候可以加载图块
          //  skipScreenSpaceErrorFactor: 128,//这三个skip的配置可以让模型立即加载
          //  backFaceCulling: true,
          //  maximumMemoryUsage: 2048
        });
      myTileSet = tileset;
      viewer.scene.primitives.add(tileset);
      update3dtiles(tileset,{scale : 1,tx: 0,ty:0,tz:0})
      tileSetAll(tileset,118.6903,32.1775,18,0,0,0,1)//0.56160331
        
      viewer.zoomTo(tileset);
      //加载楼栋模型
    for (let i=1;i<=9;++i){
      let tileset =await Cesium.Cesium3DTileset.fromUrl(
        "./data/resdata/"+i+"/tileset.json",  {
          });
        viewer.scene.primitives.add(tileset);
        tileSetAll(tileset,118.69035,32.1775,18,0,0,0,1)
        buildingTileSetArr[i-1] = tileset
    }
    for (let i=1;i<=1;++i){
      let tileset =await Cesium.Cesium3DTileset.fromUrl(
        "./data/3dgs/3dtiles/"+i+"roof/tileset.json",  {
          });
        viewer.scene.primitives.add(tileset);
        tileSetAll(tileset,roofOffset[i][0],roofOffset[i][1],roofOffset[i][2],0,0,0,1)
        roofTileSetArr[i-1] = tileset
        
      update3dtiles(tileset,{scale : roofOffset[i][3],tx: roofOffset[i][4],ty:roofOffset[i][5],tz:roofOffset[i][6]})
          viewer.zoomTo(tileset);
          
    }
    let tileset013 =await Cesium.Cesium3DTileset.fromUrl(
      "./data/3dgs/3dtiles/013/tileset.json",  {
          //  maximumScreenSpaceError: 1, //决定精细度,同样的距离,值越小越精细
          //  skipLevels: 5,
          //  skipLevelOfDetail: true,  //让cesium在遍历请求tile.json的时候可以加载图块
          //  skipScreenSpaceErrorFactor: 128,//这三个skip的配置可以让模型立即加载
          //  backFaceCulling: true,
          //  maximumMemoryUsage: 2048
        });
      viewer.scene.primitives.add(tileset013);
      tileSet(tileset013,118.69023,32.17641,6)//0.56160331, Longitude: 
      update3dtiles(tileset013,{scale : 1.2})
      tree013 = tileset013;
      //viewer.zoomTo(tileset013);
      let tileset001 =await Cesium.Cesium3DTileset.fromUrl(
        "./data/3dgs/3dtiles/001/tileset.json",  {
            //  maximumScreenSpaceError: 1, //决定精细度,同样的距离,值越小越精细
            //  skipLevels: 5,
            //  skipLevelOfDetail: true,  //让cesium在遍历请求tile.json的时候可以加载图块
            //  skipScreenSpaceErrorFactor: 128,//这三个skip的配置可以让模型立即加载
            //  backFaceCulling: true,
            //  maximumMemoryUsage: 2048
          });
        viewer.scene.primitives.add(tileset001);
        tileSet(tileset001,118.69023,32.17641,6)//0.56160331, Longitude: 
        tree001 = tileset001;
        update3dtiles(tileset001,{scale : 0.86,tx: -80,ty:-20,tz:-25})
        //viewer.zoomTo(tileset001);
    
    let tilesetTestTree =await Cesium.Cesium3DTileset.fromUrl(
      "./data/3dgs/3dtiles/testTree/tileset.json",  {
           maximumScreenSpaceError: 1, //决定精细度,同样的距离,值越小越精细
          //  skipLevels: 5,
          //  skipLevelOfDetail: true,  //让cesium在遍历请求tile.json的时候可以加载图块
          //  skipScreenSpaceErrorFactor: 128,//这三个skip的配置可以让模型立即加载
          //  backFaceCulling: true,
          //  maximumMemoryUsage: 2048
        });
        viewer.scene.primitives.add(tilesetTestTree);
        tileSet(tilesetTestTree,118.9582,32.1155,6)
        // Latitude: 32.1155, Longitude: 118.9582, Altitude: 0.03
        //scaleTileSet(tilesetTestTree, 1)
      update3dtiles(tilesetTestTree,{scale : 1,tx: 5,ty:0,tz:-1.2,rx:90})

    // Bootstrap 弹窗 DOM 插入到 HTML 页面中
    const popup = document.createElement("div");
    popup.id = "building-popup";
    popup.className = "position-absolute p-2 border rounded shadow";
    popup.style.display = "none";
    popup.style.zIndex = 9999;
    document.body.appendChild(popup);

    // 点击按钮：激活识别模式
    const identifyButton = document.querySelector('.tool-button i.bi-bounding-box')?.parentElement;
    if (identifyButton) {
        identifyButton.addEventListener('click', () => {
            isIdentifyMode = true;
            popup.style.display = "none";
        });
    }

    // 鼠标点击处理
    handler.setInputAction(async function (movement) {
        if (!isIdentifyMode) return;

        const picked = viewer.scene.pick(movement.position);
        if (Cesium.defined(picked) && picked.primitive) {
            const index = buildingTileSetArr.findIndex(ts => ts === picked.primitive);

            if (index !== -1) {
                const screenPosition = movement.position;

                // 显示弹窗
                popup.innerHTML = `建筑名称：${index + 1}号楼`;
                popup.style.left = `${screenPosition.x + 10}px`;
                popup.style.top = `${screenPosition.y + 10}px`;
                popup.style.display = "block";

                // 清除旧的高亮效果
                if (highlightTile) {
                    highlightTile.style = undefined;
                }

                // 设置新的高亮
                highlightTile = buildingTileSetArr[index];
                highlightTile.style = new Cesium.Cesium3DTileStyle({
                    color: `color('white', 0.6) * color('yellow')`
                });
            } else {
                popup.innerHTML = `未识别的建筑`;
                popup.style.left = `${movement.position.x + 10}px`;
                popup.style.top = `${movement.position.y + 10}px`;
                popup.style.display = "block";
            }
        } else {
            popup.innerHTML = `未点击到建筑`;
            popup.style.left = `${movement.position.x + 10}px`;
            popup.style.top = `${movement.position.y + 10}px`;
            popup.style.display = "block";
        }

        isIdentifyMode = false;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//性能显示
document.getElementById('performance-toggle').addEventListener('click', function () {
  viewer.scene.debugShowFramesPerSecond = ! viewer.scene.debugShowFramesPerSecond;

});

}
init()

const center = Cesium.Cartesian3.fromDegrees(118.9582, 32.1155,4);

let heading = 0;
const pitch = Cesium.Math.toRadians(-15); // 俯仰角，例如向下30°
let range = 40; // 摄像机与中心点距离
const rotationSpeed = Cesium.Math.toRadians(0.3

); // 每帧旋转速度

// setTimeout(()=>{

// viewer.clock.onTick.addEventListener(function() {
//   heading += rotationSpeed;
//   range +=0
//   viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
// });

// const positions = Cesium.Cartesian3.fromDegreesArrayHeights([
//   118.95824, 32.1155, 30, // 箭头顶部（高处）
//   118.95824, 32.1155, 9  // 箭头底部（低处）
// ]);

// const redArrow = viewer.entities.add({
//   polyline: {
//     positions: positions,
//     width: 8,
//     material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED)
//   }
// });

// },5000)

