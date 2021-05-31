/**
 * @class
 * @classdesc Scene class, used to make rendering numerous 3D perspectives easier
 */
class Scene {
  /**
   * Creates a new scene
   */
  constructor() {
    this.models = [];
    this.camera = new Camera();
    this.posX = 0;
    this.posY = 0;
    this.width = _m.width;
    this.height = _m.height;
    this.drawFaces = true;
    this.drawEdges = false;
    this.drawVertices = false;
  }

  get posX() { return this._posX; }
  get posY() { return this._posY; }
  get width() { return this._width; }
  get height() { return this._height; }
  get camera() { return this._camera; }
  get models() { return this._models; }
  get drawFaces() { return this._drawFaces; }
  get drawEdges() { return this._drawEdges; }
  get drawVertices() { return this._drawVertices; }

  set posX(value) { this._posX = value; }
  set posY(value) { this._posY = value; }
  set width(value) {
    this._width = value;
    this.camera.aspect = this.width / this.height;
  }
  set height(value) {
    this._height = value;
    this.camera.aspect = this.width / this.height;
  }
  set camera(value) { this._camera = value; } // Probably shouldn't allow this
  set models(value) { this._models = value; }
  set drawFaces(value) { this._drawFaces = value; }
  set drawEdges(value) { this._drawEdges = value; }
  set drawVertices(value) { this._drawVertices = value; }

  /**
   * Adds the given models to the scene
   * @param  {...Model} models The models to add
   */
  addModel(...models) {
    this.models.push(...models);
  }

  /**
   * Removes the given models from the scene
   * @param  {...any} models The models to remove
   */
  removeModel(...models) {
    this.models = this.models.filter((model) => {
      return (models.indexOf(model) !== -1);
    })
  }

  /**
   * Called every frame(ish), used for position updates etc.
   */
  think() {
    this.models.forEach((model) => {
      model.think();
    });
  }

  /**
   * Draws this scene to the screen
   * @param {Boolean} clip If the scene should be clipped (default true)
   */
  draw(clip=true) {
    // Cache camera matrix
    this.camera.updateMatrix();

    // Extract all the triangles from their models
    let triangles = [];
    this.models.forEach((model) => {
      model.update(this.camera);
      triangles.push(...model.triangulate());
    });

    // Get the triangles ready to render
    triangles.forEach((triangle) => {
      triangle.clip(this.camera);
      triangle.toScreen(this.width, this.height, this.posX, this.posY);
    });

    // Remove unused triangles
    triangles = triangles.filter((tri) => !tri.culled);

    // Do a depth-sort on the triangles to try make render depth accurate
    triangles.sort((a, b) => b.zMax - a.zMax);

    // Finally, draw the triangles
    if (clip) {
      _r.pushcliprect(this.posX, this.posY, this.width, this.height);
    }
    triangles.forEach((triangle) => {
      if (this.drawFaces) {
        triangle.draw();
      }
      if (this.drawEdges) {
        triangle.drawWireframe();
      }
      if (this.drawVertices) {
        triangle.drawVertices();
      }
    });
    if (clip) {
      _r.popclip();
    }
  }

  /**
   * Draws a line in 3D space to the scene
   * @param {Vector} point1 Start point
   * @param {Vector} point2 End point
   * @param {Boolean} clip If the line should be clipped to the scene
   */
  drawLine(point1, point2, width=1, clip=true) {
    let points = [
      point1.multiplyMatrix(this.camera.matrix),
      point2.multiplyMatrix(this.camera.matrix),
    ];
    // Clip the 2 points to the camera space
    if (points[0].z > 1 || points[0].z < 0) {
      if (point2.z > 1 || point2.z < 0) {
        return;
      }
      points[0] = util.getLineIntersection(points[1], points[0], new Vector(0, 0, 0), new Vector(0, 0, 1))
    } else if (points[1].z > 1 || points[1].z < 0) {
      points[1] = util.getLineIntersection(points[0], points[1], new Vector(0, 0, 0), new Vector(0, 0, 1));
    }
    // Convert points to screen coords
    const screenPoints = points.map((vert) => {
      const screenX = (vert.x + 1) * 0.5 * this.width;
      const screenY = (1 - (vert.y + 1) * 0.5) * this.height;
      return new Vector(this.posX + screenX, this.posY + screenY, vert.z);
    });
    // Finally, draw the line
    drawutil.line(
      screenPoints[0].x, screenPoints[0].y,
      screenPoints[1].x, screenPoints[1].y,
      width);
  }
}