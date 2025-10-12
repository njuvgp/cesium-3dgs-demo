Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzYmZhNGVmZS1jN2ZmLTRmMGEtYTE4Ni1mODQ3MDRhOTBkYjYiLCJpZCI6NjkxMTgsImlhdCI6MTc1NzkzNDE0NH0.JyFyVMBuBXtU5-2KlZ93STejVFhEVtXsxOKOrjqk-l0'
var viewer = new Cesium.Viewer("CesiumContainer",{
    terrain:Cesium.Terrain.fromWorldTerrain()
});

var canvas = viewer.scene.canvas;
var ellipsoid = viewer.scene.globe.ellipsoid;
//debug辅助功能：右键显示经纬度
handler = new Cesium.ScreenSpaceEventHandler(canvas);

handler.setInputAction(function (movement) {
  var cartesian = viewer.camera.pickEllipsoid(movement.position, ellipsoid);
  console.log(cartesian)
  if (cartesian) {
  var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);

  var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6); // 纬度
  var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6); // 经度
  var altitude = (viewer.camera.positionCartographic.height / 1000).toFixed(2); // 高度

  console.log(`new Cesium.Cartesian3.fromDegrees(${longitude},${latitude},0)`)
  }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

var pos = new Cesium.Cartesian3.fromDegrees(118.956582,32.114719,0)
async function init() {
    const tilesetModel = await Cesium.Cesium3DTileset.fromUrl(
     "./demodata/tileset.json" 
 ) ;
viewer.scene.primitives.add(tilesetModel); //添加到viewer
console.log(tilesetModel)

function tileSetAll(tileset,longitude,latitude,height,rotateX,rotateY,rotateZ,scale)
{
      //旋转角度设置
      var mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotateX));
      var my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(rotateY));
      var mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotateZ));
      var rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
      var rotationY = Cesium.Matrix4.fromRotationTranslation(my);
      var rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
      //平移 修改经纬度
      var position = Cesium.Cartesian3.fromDegrees(longitude,latitude,height);
      var transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      //旋转、平移矩阵相乘
      Cesium.Matrix4.multiply(transform, rotationX, transform);
      Cesium.Matrix4.multiply(transform, rotationY, transform);
      Cesium.Matrix4.multiply(transform, rotationZ, transform);
      //缩放 修改缩放比例
      var scale1 = Cesium.Matrix4.fromUniformScale(scale);
      Cesium.Matrix4.multiply(transform, scale1, transform);
      //赋值给tileset
      tileset._root.transform = transform;

}
tileSetAll(tilesetModel,118.956582,32.114719,18,0,0,0,1)//0.56160331
viewer.flyTo(tilesetModel)
}
init()
