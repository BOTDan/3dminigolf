class Model {
  constructor(pos, angles, scale) {
    this.position = pos || new Vector(0, 0, 0);
    this.rotation = angles || new Angle(0, 0, 0);
    this.scale = scale || new Vector(1, 1, 1);

    this.polygons = [];
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get rotation() { return this._rotation; }
  get angles() { return this.rotation; }
  get scale() { return this._scale; }
  get polygons() { return this._polygons; }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set rotation(value) { this._rotation = value; }
  set angles(value) { this.rotation = value; }
  set scale(value) { this._scale = value; }
  set polygons(value) { this._polygons = value; }

  addPolygon(...polygons) {
    for (const polygon of polygons) {
      this.polygons.push(polygon);
    }
  }

  getTransformationMatrix() {
    const translationMatrix = this.position.getTranslationMatrix();
    const rotationMatrix = this.rotation.getRotationMatrix();
    const scaleMatrix = this.scale.getScaleMatrix();
    return scaleMatrix.multiply(rotationMatrix).multiply(translationMatrix);
    // return translationMatrix.multiply(rotationMatrix).multiply(scaleMatrix);
  }

  /**
   * Transforms this model's polygons from local coords to world coords + matrix
   * @param {Matrix} matrix The world+camera matrix to transform by
   */
  transformPolygons(matrix) {
    const translationMatrix = this.getTransformationMatrix();
    for (const polygon of this.polygons) {
      polygon.transform(translationMatrix, matrix);
    }
  }

  /**
   * Think function. Do position calculations here.
   */
  think() {

  }

  static Cube() {
    const model = new Model();
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
    const top = new Polygon([points[1], points[0], points[3], points[2]], [1, 0, 0, 1]);
    top.flipNormal = true;
    const bottom = new Polygon([points[4], points[5], points[6], points[7]], [0, 1, 1, 1]);
    bottom.flipNormal = true;
    const front = new Polygon([points[2], points[3], points[7], points[6]], [0, 0, 1, 1]);
    front.flipNormal = true;
    const back = new Polygon([points[0], points[1], points[5], points[4]], [1, 1, 0, 1]);
    back.flipNormal = true;
    const left = new Polygon([points[1], points[2], points[6], points[5]], [0, 1, 0, 1]);
    left.flipNormal = true;
    const right = new Polygon([points[3], points[0], points[4], points[7]], [1, 0, 1, 1]);
    right.flipNormal = true;
    model.addPolygon(top, bottom, front, back, left, right);

    model.think = function() {
      this.rotation.pitch += 0.005;
      this.rotation.yaw += 0.005;
    }
    return model;
  }
}