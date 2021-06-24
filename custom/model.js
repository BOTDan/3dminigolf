class Model {
  constructor(pos, angles, scale) {
    this.position = pos || new Vector(0, 0, 0);
    this.rotation = angles || new Angle(0, 0, 0);
    this.scale = scale || new Vector(1, 1, 1);

    this.verts = [];
    this.faces = [];
    this.uvs = [];
    this.texture = null;

    this.visible = true;
    this.zIndex = 0;

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
  get uvs() { return this._uvs; }
  get texture() { return this._texture; }
  get worldVerts() { return this._worldVerts; }
  get cameraVerts() { return this._cameraVerts; }
  get visible() { return this._visible; }
  get zIndex() { return this._zIndex; }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set rotation(value) { this._rotation = value; }
  set angles(value) { this.rotation = value; }
  set scale(value) { this._scale = value; }
  set verts(value) { this._verts = value; }
  set faces(value) { this._faces = value; }
  set uvs(value) { this._uvs = value; }
  set texture(value) {
    this._texture = value;
    this.faces.forEach((face) => { face.texture = value; });
  }
  set visible(value) { this._visible = value; }
  set zIndex(value) {
    this._zIndex = value;
    this.faces.forEach((face) => { face.zIndex = value; });
  }

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
  addFace(...faces) {
    faces.forEach((face) => {
      face.zIndex = this.zIndex;
      face.texture = this.texture;
      face.calcColour = (tri) => { return this.calcColour(tri); };
    })
    return this.faces.push(...faces);
  }

  /**
   * Returns a matrix to convert local coords to world coords
   * @returns {Matrix} The transformatiuo matrix of this model
   */
  getTransformationMatrix() {
    const translationMatrix = this.position.getTranslationMatrix();
    const rotationMatrix = this.rotation.getRotationMatrix().invert(); // Why does this need inverting??
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
    this._cameraVerts = this._worldVerts.map((vert) => {
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
    if (!this.visible) { return []; }
    const triangles = [];
    this.faces.forEach((face) => {
      triangles.push(...face.triangulate(this._cameraVerts, this._worldVerts, this.uvs));
    });
    return triangles;
  }

  /**
   * Think function. Do position calculations here.
   */
  think() {

  }

  /**
   * Function used to calculate a triangle's colour. Useful for faking lighting.
   */
  calcColour(triangle) {
    return triangle.colour;
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
    // top.flipNormal = true;
    const bottom = new Face([4, 5, 6, 7], [0, 1, 1, 1]);
    // bottom.flipNormal = true;
    const front = new Face([2, 3, 7, 6], [0, 0, 1, 1]);
    // front.flipNormal = true;
    const back = new Face([0, 1, 5, 4], [1, 1, 0, 1]);
    // back.flipNormal = true;
    const left = new Face([1, 2, 6, 5], [0, 1, 0, 1]);
    // left.flipNormal = true;
    const right = new Face([3, 0, 4, 7], [1, 0, 1, 1]);
    // right.flipNormal = true;

    const model = new Model();
    model.verts = points;
    model.addFace(top, bottom, front, back, left, right);

    model.think = function() {
      this.rotation.pitch += 0.1;
      this.rotation.yaw += 0.1;
    }
    return model;
  }

  /**
   * Calculates flat lighting for a given triangle
   * @param {Triangle} triangle The triangle to calculate light for
   * @returns {Colour} A colour
   */
  static flatLighting(triangle) {
    const normal = util.findNormal(triangle.worldVerts).invert();
    const amount = normal.dot(new Vector(-1, -5, -1).normalize());
    const amountUp = (1 + amount) / 2;
    return [amountUp, amountUp, amountUp, 1];
  }
}