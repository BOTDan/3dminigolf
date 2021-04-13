class Model2 {
  constructor(pos, angles, scale) {
    this.position = pos || new Vector(0, 0, 0);
    this.rotation = angles || new Angle(0, 0, 0);
    this.scale = scale || new Vector(1, 1, 1);

    this.verts = [];
    this.faces = [];

    this._worldVerts = [];
    this._cameraVerts = [];
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get rotation() { return this._rotation; }
  get angles() { return this.rotation; }
  get scale() { return this._scale; }
  get verts() { return this._verts; }
  get faces() { return this._faces; }
  get worldVerts() { return this._worldVerts; }
  get cameraVerts() { return this._cameraVerts; }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set rotation(value) { this._rotation = value; }
  set angles(value) { this.rotation = value; }
  set scale(value) { this._scale = value; }
  set verts(value) { this._verts = value; }
  set faces() { this._faces = value; }

  /**
   * Adds vertices to this model
   * @param  {...Vector} verts The vert(s) to add
   * @returns The new vertex count
   */
  addVert(...verts) {
    return this.verts.push(...verts);
  }

  /**
   * Adds faces to this model
   * @param  {...Face} face The face(s) to add
   * @returns The new faces count
   */
  addFace(...face) {
    return this.faces.push(...face);
  }

  /**
   * Returns a matrix to convert local coords to world coords
   * @returns {Matrix} The transformatiuo matrix of this model
   */
  getTransformationMatrix() {
    const translationMatrix = this.position.getTranslationMatrix();
    const rotationMatrix = this.rotation.getRotationMatrix();
    const scaleMatrix = this.scale.getScaleMatrix();
    return scaleMatrix.multiply(rotationMatrix).multiply(translationMatrix);
  }

  /**
   * Internally updates the worldVerts list
   */
  updateWorldVerts() {
    const transformationMatrix = this.getTransformationMatrix();
    this._worldVerts = this.verts.map((vert) => {
      return vert.multiplyMatrix(transformationMatrix);
    });
  }

  /**
   * Internally updates the cameraVerts list
   * @param {Camera} camera The camera to use
   */
  updateCameraVerts(camera) {
    this._cameraVerts = this.verts.map((vert) => {
      return vert.multiplyMatrix(camera.matrix);
    });
  }

  /**
   * Helper function to internally update lists before triangulation.
   * @param {Camera} camera The camera to use
   */
  update(camera) {
    this.updateWorldVerts();
    this.updateCameraVerts(camera);
  }

  /**
   * Returns a list of triangles to render, representing this model
   * @returns {Triangle[]} A list of triangles to render
   */
  triangulate() {
    const triangles = [];
    this.faces.forEach((face) => {
      triangles.push(...face.triangulate(this._cameraVerts));
    });
    return triangles;
  }

  /**
   * Think function. Do position calculations here.
   */
  think() {

  }

  static Cube() {
    const points = [
      new Vector(1, 1, 1),
      new Vector(-1, 1, 1),
      new Vector(-1, 1, -1),
      new Vector(1, 1, -1),
      new Vector(1, -1, 1),
      new Vector(-1, -1, 1),
      new Vector(-1, -1, -1),
      new Vector(1, -1, -1),
    ];
    const top = new Face([1, 0, 3, 2], [1, 0, 0, 1]);
    top.flipNormal = true;
    const bottom = new Face([4, 5, 6, 7], [0, 1, 1, 1]);
    bottom.flipNormal = true;
    const front = new Face([2, 3, 7, 6], [0, 0, 1, 1]);
    front.flipNormal = true;
    const back = new Face([0, 1, 5, 4], [1, 1, 0, 1]);
    back.flipNormal = true;
    const left = new Face([1, 2, 6, 5], [0, 1, 0, 1]);
    left.flipNormal = true;
    const right = new Face([3, 0, 4, 7], [1, 0, 1, 1]);
    right.flipNormal = true;

    const model = new Model2();
    model.verts = points;
    model.addFace(top, bottom, front, back, left, right);

    model.think = function() {
      this.rotation.pitch += 0.005;
      this.rotation.yaw += 0.005;
    }
    return model;
  }
}