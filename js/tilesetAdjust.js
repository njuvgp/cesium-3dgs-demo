function tileSet(tileset,longitude, latitude, height)
{
    //3dtile模型的边界球体
    var boundingSphere = tileset.boundingSphere;
    //迪卡尔空间直角坐标=>地理坐标（弧度制）
    var cartographic_original = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    //设置新的经度、纬度、高度
    var cartographic_offset  = Cesium.Cartographic.fromDegrees(longitude, latitude, height)
    //地理坐标（弧度制）=>迪卡尔空间直角坐标
    var Cartesian3_original = Cesium.Cartesian3.fromRadians(cartographic_original.longitude, cartographic_original.latitude, cartographic_original.height);
    var Cartesian3_offset  = Cesium.Cartesian3.fromRadians(cartographic_offset.longitude, cartographic_offset.latitude, cartographic_offset.height);
    //获得地面和offset的转换
    var translation = Cesium.Cartesian3.subtract(Cartesian3_offset, Cartesian3_original, new Cesium.Cartesian3());

    //修改模型矩阵
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}
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
function scaleTileSet(tileset, scale) {
    // 获取 tileset 的包围球中心点（Cartesian3）
    var center = tileset.boundingSphere.center;

    // 构造平移到原点的矩阵（向量取反）
    var toOrigin = Cesium.Matrix4.fromTranslation(
        Cesium.Cartesian3.negate(center, new Cesium.Cartesian3())
    );

    // 构造缩放矩阵
    var scaleMatrix = Cesium.Matrix4.fromUniformScale(scale);

    // 构造从原点平移回原位置的矩阵
    var backToPosition = Cesium.Matrix4.fromTranslation(center);

    // 组合三个变换矩阵：M = T_back * S * T_toOrigin
    var transformMatrix = Cesium.Matrix4.multiply(
        backToPosition,
        Cesium.Matrix4.multiply(scaleMatrix, toOrigin, new Cesium.Matrix4()),
        new Cesium.Matrix4()
    );

    // 应用到 tileset 的 modelMatrix
    tileset.modelMatrix = transformMatrix;
}
function update3dtiles(tileSet, options) {
    const { tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, scale = 1,sx =1,sy =1,sz =1 } = options
    console.log(tx,ty,tz,rx,ry,rz,scale,'模型变换参数')
    const center = tileSet.boundingSphere.center
  
    //定义以模型中心为原点的局部坐标转换
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(center)
  
    //构建平移向量
    const tempTranslation = new Cesium.Cartesian3(tx, ty, tz)
  
    //平移向量转换到世界坐标;
    const offset = Cesium.Matrix4.multiplyByPoint(
      m,
      tempTranslation,
      new Cesium.Cartesian3(0, 0, 0)
    )
  
    //计算世界坐标下的平移向量
    const translation = Cesium.Cartesian3.subtract(
      offset,
      center,
      new Cesium.Cartesian3()
    )
    //平移向量应用到模型
    tileSet.modelMatrix = Cesium.Matrix4.multiply(
      Cesium.Matrix4.fromTranslation(translation),
      tileSet.modelMatrix,
      new Cesium.Matrix4()
    )
  
    //旋转及缩放
    if (rx || ry || rz || scale) {
      //保存原始位置
      const initialCenter = Cesium.Cartesian3.clone(tileSet.boundingSphere.center)
      
      // 构建模型平移到原点矩阵
      const translationMatrix = Cesium.Matrix4.fromTranslation(
        Cesium.Cartesian3.negate(
          tileSet.boundingSphere.center,
          new Cesium.Cartesian3()
        )
      )
  
      // 定义旋转角度（单位：弧度）
      const radiansX = Cesium.Math.toRadians(rx)
      const radiansY = Cesium.Math.toRadians(ry)
      const radiansZ = Cesium.Math.toRadians(rz)
  
      // 创建旋转矩阵
      const rotationX = Cesium.Matrix3.fromRotationX(radiansX)
      const rotationY = Cesium.Matrix3.fromRotationY(radiansY)
      const rotationZ = Cesium.Matrix3.fromRotationZ(radiansZ)
  
      // 组合旋转矩阵
      const combinedRotation = Cesium.Matrix3.multiply(
        rotationX,
        rotationY,
        new Cesium.Matrix3()
      )
      Cesium.Matrix3.multiply(combinedRotation, rotationZ, combinedRotation)
  
      // 将 3x3 旋转矩阵转换为 4x4 矩阵
      const rotationMatrix4 = Cesium.Matrix4.fromRotation(combinedRotation)
  
      //构建缩放矩阵
      let scaleTempParam = new Cesium.Cartesian3(scale, scale, scale)
      if(sx!=1 || sy!=1 || sz!=1){
        scaleTempParam = new Cesium.Cartesian3(sx, sy, sz)
      }
      const scaleMatrix4 = Cesium.Matrix4.fromScale(
        scaleTempParam,
        new Cesium.Matrix4()
      )
  
      //构建平移复位矩阵
      const translationBack = Cesium.Matrix4.fromTranslation(initialCenter)
  
      //组合矩阵
      let tempMatrix = tileSet.modelMatrix
      //1.应用移到原点
      tempMatrix = Cesium.Matrix4.multiply(
        translationMatrix,
        tempMatrix,
        new Cesium.Matrix4()
      )
      //2.应用旋转矩阵
      tempMatrix = Cesium.Matrix4.multiply(
        rotationMatrix4,
        tempMatrix,
        new Cesium.Matrix4()
      )
      //3.应用缩放矩阵
      tempMatrix = Cesium.Matrix4.multiply(
        scaleMatrix4,
        tempMatrix,
        new Cesium.Matrix4()
      )
      //4.应用复位矩阵
      tempMatrix = Cesium.Matrix4.multiply(
        translationBack,
        tempMatrix,
        new Cesium.Matrix4()
      )
      tileSet.modelMatrix = tempMatrix
    }
  
    return tileSet
  }
  