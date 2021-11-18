/**
 * @class
 * @classdesc A 3D triangle for rendering. INTERNAL.
 */
class Triangle {
  /**
   * Creates a triangle for rendering.
   * INTERNAL. Should be created using faces.
   * @param {Vector} vert1 Vertex 1
   * @param {Vector} vert2 Vertex 2
   * @param {Vector} vert3 Vertex 3
   * @param {Number[]} colour Colour of the triangle
   * @param {Boolean} flipNormal If the normal for this triangle should be flipped
   */
  constructor(vert1, vert2, vert3, colour, flipNormal, zIndex) {
    this.verts = [vert1, vert2, vert3];
    this.colour = colour || [1, 1, 1, 1];
    this.flipNormal = flipNormal || false;
    this.zIndex = zIndex || 0;
    this.uvs = [];
    this.texture = null;

    this.worldVerts = [];

    this._clippedVerts = [];
    this._screenVerts = [];

    this._normal = null;
    this._zMin = null;
    this._zMax = null;
    this._zAvg = null;
    this._culled = false;
  }

  get verts() { return this._verts; }
  get colour() { return this._colour; }
  get flipNormal() { return this._flipNormal; }
  get normal() { return this._normal; }
  get zMin() { return this._zMin; }
  get zMax() { return this._zMax; }
  get zAvg() { return this._zAvg; }
  get clippedVerts() { return this._clippedVerts; }
  get screenVerts() { return this._screenVerts; }
  get culled() { return this._culled; }
  get worldVerts() { return this._worldVerts; }
  get zIndex() { return this._zIndex; }
  get uvs() { return this._uvs; }
  get texture() { return this._texture; }

  set verts(value) { this._verts = value; }
  set colour(value) { this._colour = value; }
  set flipNormal(value) { this._flipNormal = value; }
  set worldVerts(value) { this._worldVerts = value; }
  set zIndex(value) { this._zIndex = value; }
  set uvs(value) { this._uvs = value; }
  set texture(value) { this._texture = value; }

  /**
   * Internally updates the zmin, zmax and zavg. Usually called after clipping
   */
  updateZValues() {
    const zValues = this.clippedVerts.map(vert => vert.z);
    this._zMin = Math.min(...zValues);
    this._zMax = Math.max(...zValues);
    this._zAvg = zValues.reduce((acc, z) => acc + z, 0) / zValues.length;
  }

  /**
   * Returns true if the point is outside the valid Z range
   * Only here as may be expanded for ortho projection in future
   * @param {Vector} point The point to check
   * @returns {Boolean}
   */
  isPointOutsideZ(point) {
    return (point.z > 1 || point.z < 0);
  }

  /**
   * Calculates if this triangle should be backface-culled
   * @returns {Boolean}
   */
  shouldCull() {
    let normal = util.findNormal(this.clippedVerts);
    if (normal === null) { return true; }
    if (this.flipNormal) { normal = normal.invert(); }
    this._normal = normal;
    const dot = new Vector(0, 0, 1).dot(normal);
    return (dot < 0);
  }

  /**
   * Clips the given edge to the given near plane. 
   * @param {Vector} point1 The start point of the edge
   * @param {Vector} point2 The end point of the edge
   * @param {Number} near The near clipping plane depth
   * @returns {Vector[]}
   */
  clipEdge(point1, point2, near=0) {
    const planePoint = new Vector(0, 0, 0);
    const planeNormal = new Vector(0, 0, 1);
    if (this.isPointOutsideZ(point1)) {
      if (this.isPointOutsideZ(point2)) {
        // Both outside, useless
        return [];
      }
      // Moving from outside to inside
      const point = util.getLineIntersection(point2, point1, planePoint, planeNormal).point;
      return [point];
    } else {
      if (this.isPointOutsideZ(point2)) {
        // Moving from inside to outside
        const point = util.getLineIntersection(point1, point2, planePoint, planeNormal).point;
        return [point1, point];
      }
      // Both inside, nothing needs to be done
      return [point1]
    }
  }

  /**
   * Clips this polygon's edges, ready for rendering
   * @param {Camera} camera The camera for near clipping
   */
  clip(camera) {
    const clippedVerts = [];
    const point1 = this.verts[0];
    const point2 = this.verts[1];
    const point3 = this.verts[2];
    clippedVerts.push(...this.clipEdge(point1, point2, camera.near));
    clippedVerts.push(...this.clipEdge(point2, point3, camera.near));
    clippedVerts.push(...this.clipEdge(point3, point1, camera.near));
    this._clippedVerts = clippedVerts;
    this._culled = this.shouldCull();
    this.updateZValues();
  }

  /**
   * Converts the internal clipped verts to screen verts, ready for drawing
   * @param {Number} width Screen width
   * @param {Number} height Screen height
   * @param {Number} x Start x position
   * @param {Number} y Start y position
   */
  toScreen(width=_m.width, height=_m.height, x=0, y=0) {
    this._screenVerts = this.clippedVerts.map((vert) => {
      const screenX = (vert.x + 1) * 0.5 * width;
      const screenY = (1 - (vert.y + 1) * 0.5) * height;
      return new Vector(x + screenX, y + screenY, vert.z);
    });
  }

  /**
   * Used to overwrite the colour at render. Useful for faking lighting.
   * @returns {Number[]}
   */
  calcColour() {
    return this.colour;
  }

  /**
   * Draws this polygon to the screen
   */
  draw() {
    if (this.culled) { return; }
    const colour = this.calcColour();
    for (let i=1; i < this.screenVerts.length - 1; i++) {
      const point1 = this.screenVerts[0];
      const point2 = this.screenVerts[i];
      const point3 = this.screenVerts[i+1];
      const uv1 = this.uvs[0] || new Vector();
      const uv2 = this.uvs[1] || new Vector();
      const uv3 = this.uvs[2] || new Vector();
      _r.color(...colour);
      _r.quad(
        point1.x, point1.y, uv1.x, 1-uv1.y,
        point2.x, point2.y, uv2.x, 1-uv2.y,
        point3.x, point3.y, uv3.x, 1-uv3.y,
        point3.x, point3.y, uv3.x, 1-uv3.y,
        this.texture
      );
    }
  }

  /**
   * Draws this triangles wireframe to the screen
   */
  drawWireframe(overrideCull) {
    if (this.culled && !overrideCull) { return; }
    for (let i=1; i < this.screenVerts.length - 1; i++) {
      const point1 = this.screenVerts[0];
      const point2 = this.screenVerts[i];
      const point3 = this.screenVerts[i+1];
      _r.color(0, 1, 1, 1);
      drawutil.line(point1.x, point1.y, point2.x, point2.y);
      drawutil.line(point3.x, point3.y, point2.x, point2.y);
    }
    if (this.screenVerts.length > 2) {
      const point1 = this.screenVerts[0];
      const point2 = this.screenVerts[this.screenVerts.length-1];
      drawutil.line(point1.x, point1.y, point2.x, point2.y);
    }
  }

  /**
   * Draws this triangles vertices to the screen
   */
  drawVertices() {
    this.screenVerts.forEach((vert, i) => {
      _r.color(0, 1, 1, 1);
      _r.rect(vert.x-4, vert.y-4, 8, 8);
    });
  }

  /**
   * Draws this triangles vertex numbers to the screen
   */
  drawVertNumbers() {
    GameBase.Text.SetFont("Mplus1m Bold");
    GameBase.Text.SetSize(12);
    this.screenVerts.forEach((vert, i) => {
      _r.color(0, 0, 1, 1);
      GameBase.Text.DrawText(vert.x, vert.y, `${i}`, 1, 1);
    });
  }
}