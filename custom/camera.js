/**
 * @class
 * @classdesc Represents a camera in 3D space
 */
class Camera {
  /**
   * 
   * @param {Vector} pos The position of the camera
   * @param {Angle} angles The angles of the camera
   * @param {Number} fov The vertical FOV of the camera
   */
  constructor(pos, angles, fov, aspect, near, far) {
    this.position = pos || new Vector(0, 0, 0);
    this.rotation = angles || new Angle(0, 0, 0);
    this.aspect = aspect || (_m.width/_m.height);
    this.fov = fov || 100;
    this.near = near || 0.001;
    this.far = far || 100;
    this.updateMatrix();
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get rotation() { return this._rotation; }
  get angles() { return this.rotation; }
  get fov() { return this._fov; }
  get fovY() { return this._fovY; }
  get aspect() { return this._aspect; }
  get near() { return this._near; }
  get far() { return this._far; }
  get matrix() {
    if (!this._matrix) {
      this._matrix = this.getFinalMatrix();
    }
    return this._matrix;
  }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set rotation(value) { this._rotation = value; }
  set angles(value) { this.rotation = value; }
  set fovY(value) { this._fovY = value; }
  set fov(value) {
    const fovXrad = value * (Math.PI / 180);
    const fovYrad = 2 * Math.atan(Math.tan(fovXrad / 2) * 1/this.aspect);
    this.fovY = fovYrad * (180 / Math.PI);
    this._fov = value;
  }
  set aspect(value) { this._aspect = value; }
  set near(value) { this._near = value; }
  set far(value) { this._far = value; }

  /**
   * Get the transformation matrix to convert world coords to camera-relative coords
   * @returns {Matrix} A transformation matrix
   */
  getTransformationMatrix() {
    const translationMatrix = this.position.invert().getTranslationMatrix();
    const rotationMatrix = this.rotation.invert().getRotationMatrix();
    const transformationMatrix = translationMatrix.multiply(rotationMatrix);
    return transformationMatrix;
  }

  /**
   * Gets the perspective projection matrix for this camera
   * @returns {Matrix} A projection matrix
   */
  getPerspectiveProjectionMatrix() {
    const halfHeight = this.near * Math.tan((this.fovY/2) * (Math.PI / 180));
    const halfWidth = halfHeight * this.aspect;
    const depth = this.far - this.near;
    
    const matrix = new Matrix(4, 4);
    matrix[0][0] = this.near / halfWidth;
    matrix[1][1] = this.near / halfHeight;
    matrix[2][2] = (-(this.far + this.near)) / depth;
    matrix[3][2] = -2 * ((this.far * this.near) / depth);
    matrix[2][3] = -1;
    return matrix;
  }

  /**
   * Gets the orthographic projection matrix for this camera
   * @ignore
   * @returns {Matrix} A projection matrix
   */
  getOrthoProjectionMatrix() {
    const focalDistance = this.near;
    const top = focalDistance * Math.tan((this.fovY/2) * (Math.PI / 180));
    const bottom = -top;
    const right = top * this.aspect;
    const left = -right;
    const near = this.near;
    const far = this.far;
  
    const matrix = new Matrix(4, 4);
    matrix[0][0] = 2 / (right - left);
    matrix[1][1] = 2 / (top - bottom);
    matrix[2][2] = -2 / (far - near);
    matrix[3][3] = 1;
    matrix[3][0] = - (right + left) / (right - left);
    matrix[3][1] = - (top + bottom) / (top - bottom);
    matrix[3][2] = - (far + near) / (far - near);
    
    return matrix;
  }

  /**
   * Returns a single transformation matrix to move world coords to camera coords.
   * @returns {Matrix} A transformation matrix
   */
  getFinalMatrix() {
    const transformationMatrix = this.getTransformationMatrix();
    const projectionMatrix = this.getPerspectiveProjectionMatrix();
    return transformationMatrix.multiply(projectionMatrix);
  }

  /**
   * Updates the internal .matrix property. Should be used every frame before rendering
   */
  updateMatrix() {
    this._matrix = this.getFinalMatrix();
  }
}