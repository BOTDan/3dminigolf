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
   * Sort function used for z-sorting triangles
   * @param {Triangle} a TThe first triangle
   * @param {Triangle} b The second triangle
   * @returns {Number} The order of a to b
   */
  sort(a, b) {
    if (a.zIndex === b.zIndex) {
      return b.zMax - a.zMax;
    }
    return a.zIndex - b.zIndex;
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
    triangles.sort(this.sort);

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
      if (points[1].z > 1 || points[1].z < 0) {
        return;
      }
      points[0] = util.getLineIntersection(points[1], points[0], new Vector(0, 0, 0), new Vector(0, 0, 1)).point
    } else if (points[1].z > 1 || points[1].z < 0) {
      points[1] = util.getLineIntersection(points[0], points[1], new Vector(0, 0, 0), new Vector(0, 0, 1)).point;
    }
    // Convert points to screen coords
    const screenPoints = points.map((vert) => {
      const screenX = (vert.x + 1) * 0.5 * this.width;
      const screenY = (1 - (vert.y + 1) * 0.5) * this.height;
      return new Vector(this.posX + screenX, this.posY + screenY, vert.z);
    });
    // Finally, draw the line
    if (clip) {
      _r.pushcliprect(this.posX, this.posY, this.width, this.height);
    }
    drawutil.line(
      screenPoints[0].x, screenPoints[0].y,
      screenPoints[1].x, screenPoints[1].y,
      width);
    if (clip) {
      _r.popclip();
    }
  }

  /**
   * Draws a point in 3D space to the screen
   * @param {Vector} point The point
   * @param {Number} width The width of the point
   * @param {Boolean} clip If the point should be clipped to the scene
   * @returns 
   */
  drawPoint(point, width=1, clip=true) {
    // Convert world point to clip space
    point = point.multiplyMatrix(this.camera.matrix);
    if (point.z > 1 || point.z < 0) {
      return;
    }
    // Convert clip space point to screen point
    const screenX = (point.x + 1) * 0.5 * this.width;
    const screenY = (1 - (point.y + 1) * 0.5) * this.height;
    const screenPoint = new Vector(this.posX + screenX, this.posY + screenY, point.z);
    // Finally, draw the point
    if (clip) {
      _r.pushcliprect(this.posX, this.posY, this.width, this.height);
    }
    _r.rect(screenPoint.x - (width/2), screenPoint.y - (width/2), width, width);
    if (clip) {
      _r.popclip();
    }
  }

  /**
   * Converts a point on the screen to a look direction
   * @param {Number} x The screen x coord
   * @param {Number} y The screen y coord
   * @returns {Vector} A normal vector that looks at the given screen point
   */
  screenPosToLookDir(x, y) {
    // Make sure point is within the scene
    if (x < this.posX || x > this.posX + this.width) {
      return null;
    }
    if (y < this.posY || y > this.posY + this.height) {
      return null;
    }
    const amountX = -1 + ((x - this.posX) / this.width) * 2;
    const amountY = -1 + (-(y - this.posY) / this.height + 1) * 2;
    const pos = new Vector(amountX, amountY, 0);
    const matrix = this.camera.matrix.invert();
    const converted = pos.multiplyMatrix(matrix);
    const normal = converted.subtract(this.camera.position).normalize();
    return normal;
  }
}