function test1() {
  const camPos = new mathgl.Vector3(1, 2, -10);
  const camAngle = new mathgl.Euler(0, 0, 0); // Roll Pitch Yaw
  const translation = new mathgl.Matrix4();
  translation.translate(camPos);
  // const projection = new mathgl.Matrix4().perspective({fov: 90 * (Math.PI / 180), aspect: (_m.width / _m.height), near: 1, far: 100});
  const projection = new mathgl.Matrix4().orthographic({fovy: 59 * (Math.PI / 180), focalDistance: 1, aspect: (_m.width / _m.height), near: 1, far: 100})
  print(projection);
  const vert1 = new mathgl.Vector3(0, 0, 1000);
  const vert2 = new mathgl.Vector3(0, 3, -1000);
  // Translate the vert
  vert1.transform(translation);
  vert1.transform(projection);
  vert2.transform(translation);
  vert2.transform(projection);
  print(vert1);
  print(vert2);
}

function test2() {
  const camPos = new Vector(1, 2, -10);
  // const projection = getViewFrustrum(90, _m.width / _m.height, 1, 100);
  const projection = testOrtho();
  print(projection);
  let vert1 = new Vector(0, 0, 1000);
  let vert2 = new Vector(0, 3, -1000);
  // Translate the vert
  vert1 = vert1.multiplyMatrix(camPos.getTranslationMatrix());
  vert1 = vert1.multiplyMatrix(projection);
  vert2 = vert2.multiplyMatrix(camPos.getTranslationMatrix());
  vert2 = vert2.multiplyMatrix(projection);
  print(vert1);
  print(vert2);
}

/** WORKING */
function getViewFrustrum(fov, aspect, near, far) {
  const halfHeight = near * Math.tan((fov/2) * (Math.PI / 180));
  const halfWidth = halfHeight * aspect;
  const depth = far - near;
  
  const matrix = new Matrix(4, 4);
  matrix[0][0] = near / halfWidth;
  matrix[1][1] = near / halfHeight;
  matrix[2][2] = (-(far + near))/depth;
  matrix[3][2] = -2 * ((far * near)/depth);
  matrix[2][3] = -1;
  return matrix;
}

function testOrtho() {
  const fovy = 59
  const focalDistance = 1;
  const top = focalDistance * Math.tan((fovy/2) * (Math.PI / 180));
  const bottom = -top;
  const right = top * _m.width/_m.height;
  const left = -right;
  const near = 0.1;
  const far = 100;

  const matrix = new Matrix(4, 4);
  // matrix[0][0] = -2 * (1 / (left - right));
  // matrix[1][1] = -2 * (1 / (bottom - top));
  // matrix[2][2] = 2 * (1 / (near - far));
  // matrix[3][3] = 1;
  // matrix[3][0] = (left + right) * (1 / (left - right));
  // matrix[3][1] = (top + bottom) * (1 / (bottom - top));
  // matrix[3][2] = (near + far) * (1 / (near - far))
  matrix[0][0] = 2 / (right - left);
  matrix[1][1] = 2 / (top - bottom);
  matrix[2][2] = -2 / (far - near);
  matrix[3][3] = 1;
  matrix[3][0] = - (right + left) / (right - left);
  matrix[3][1] = - (top + bottom) / (top - bottom);
  matrix[3][2] = - (far + near) / (far - near);
  
  return matrix;
}

test1()
print("----------------------------------------------------------------------------------------------------")
test2();