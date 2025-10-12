#ifndef HAS_SPLAT_TEXTURE

// ------------------------------
// 计算三维高斯的协方差矩阵 (3D Covariance)
// 输入：scale 缩放，rot 四元数旋转
// 输出：cov3D[6]（对称矩阵的六个独立元素）
// ------------------------------
void calcCov3D(vec3 scale, vec4 rot, out float[6] cov3D) {
    // 缩放矩阵
    mat3 S = mat3(u_splatScale * scale[0], 0, 0,
                  0, u_splatScale * scale[1], 0,
                  0, 0, u_splatScale * scale[2]);

    // 四元数转旋转矩阵
    float r = rot.w, x = rot.x, y = rot.y, z = rot.z;
    mat3 R = mat3(
        1. - 2. * (y*y + z*z), 2.*(x*y - r*z), 2.*(x*z + r*y),
        2.*(x*y + r*z), 1. - 2.*(x*x + z*z), 2.*(y*z - r*x),
        2.*(x*z - r*y), 2.*(y*z + r*x), 1. - 2.*(x*x + y*y)
    );

    // 协方差矩阵 Σ = (S*R)^T * (S*R)
    mat3 M = S * R;
    mat3 Sigma = transpose(M) * M;

    // 对称矩阵仅存储6个独立元素
    cov3D = float[6](Sigma[0][0], Sigma[0][1], Sigma[0][2],
                     Sigma[1][1], Sigma[1][2], Sigma[2][2]);
}

// ------------------------------
// 计算三维高斯投影到二维图像平面的协方差 (2D Covariance)
// ------------------------------
vec3 calcCov2D(vec3 worldPos, float fx, float fy,
               float tan_fovx, float tan_fovy,
               float[6] cov3D, mat4 viewMat) {
    vec4 t = viewMat * vec4(worldPos, 1.0);

    // 限制FOV范围，防止极值溢出
    float limx = 1.3 * tan_fovx, limy = 1.3 * tan_fovy;
    t.x = clamp(t.x / t.z, -limx, limx) * t.z;
    t.y = clamp(t.y / t.z, -limy, limy) * t.z;

    // 投影雅可比矩阵 (Jacobian)
    mat3 J = mat3(fx / t.z, 0, -(fx * t.x) / (t.z * t.z),
                  0, fy / t.z, -(fy * t.y) / (t.z * t.z),
                  0, 0, 0);

    // 提取视图矩阵的旋转部分
    mat3 W = mat3(viewMat);
    mat3 T = W * J;

    // 构造协方差矩阵
    mat3 V = mat3(
        cov3D[0], cov3D[1], cov3D[2],
        cov3D[1], cov3D[3], cov3D[4],
        cov3D[2], cov3D[4], cov3D[5]
    );

    // 投影协方差
    mat3 cov = transpose(T) * V * T;
    cov[0][0] += .3; cov[1][1] += .3;

    // 仅返回二维协方差的三要素
    return vec3(cov[0][0], cov[0][1], cov[1][1]);
}

// ------------------------------
// 高斯光斑绘制主函数（无纹理版本）
// ------------------------------
void gaussianSplatStage(ProcessedAttributes attr, inout vec4 posClip) {
    mat4 viewMat = czm_modelView;
    vec4 clipPos = czm_modelViewProjection * vec4(a_splatPosition, 1.0);
    posClip = clipPos;

    float[6] cov3D;
    calcCov3D(attr.scale, attr.rotation, cov3D);
    vec3 cov = calcCov2D(a_splatPosition, u_focalX, u_focalY,
                         u_tan_fovX, u_tan_fovY, cov3D, viewMat);

    // 计算特征值（lambda1, lambda2）
    float mid = (cov.x + cov.z) * 0.5;
    float radius = length(vec2((cov.x - cov.z) * 0.5, cov.y));
    float lambda1 = mid + radius, lambda2 = mid - radius;

    if (lambda2 < 0.0) return; // 无效协方差则丢弃

    // 求特征向量
    vec2 diagVec = normalize(vec2(cov.y, lambda1 - cov.x));
    vec2 v1 = min(sqrt(2.0 * lambda1), 1024.0) * diagVec;
    vec2 v2 = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagVec.y, -diagVec.x);

    // 顶点扩展（形成屏幕空间椭圆）
    vec2 corner = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2) - 1.;
    posClip += vec4((corner.x * v1 + corner.y * v2) * 4.0 / czm_viewport.zw * posClip.w, 0, 0);
    posClip.z = clamp(posClip.z, -abs(posClip.w), abs(posClip.w));

    v_vertPos = corner;
    v_splatColor = a_splatColor;
}

#else
// ------------------------------
// 有纹理输入的版本省略（原理相同）
// ------------------------------
#endif
