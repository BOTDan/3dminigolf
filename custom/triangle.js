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
  constructor(vert1, vert2, vert3, colour, flipNormal) {
    this.verts = [vert1, vert2, vert3];
    this.colour = colour || [1, 0, 0, 1];
    this.flipNormal = flipNormal || false;

    this._clippedVerts = [];
    this._screenVerts = [];

    this._normal = null;
    this._nearZ = null;
    this._farZ = null;
    this._avgZ = null;
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

  set verts(value) { this._verts = value; }
  set colour(value) { this._colour = value; }
  set flipNormal(value) { this._flipNormal = value; }
  set worldVerts(value) { this._worldVerts = value; }

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
    const normal = util.findNormal(this.clippedVerts);
    if (normal === null) { return true; }
    const dot = new Vector(0, 0, -1).dot(normal);
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
    const planePoint = new Vector(0, 0, near);
    const planeNormal = new Vector(0, 0, 1);
    if (this.isPointOutside(point1)) {
      if (this.isPointOutside(point2)) {
        // Both outside, useless
        return [];
      }
      // Moving from outside to inside
      const point = util.getLineIntersection(point1, point2, planePoint, planeNormal);
      return [point];
    } else {
      if (this.isPointOutside(point2)) {
        // Moving from inside to outside
        const point = util.getLineIntersection(point1, point2, planePoint, planeNormal);
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
   */
  toScreen(width=_m.width, height=_m.height) {
    this._screenVerts = this.clippedVerts.map((vert) => {
      const screenX = (vert.x + 1) * 0.5 * width;
      const screenY = (1 - (vert.y + 1) * 0.5) * height;
      return new Vector(screenX, screenY, vert.z);
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
      _r.color(...colour);
      _r.quad(
        point1.x, point1.y, 0, 0,
        point2.x, point2.y, 1, 0,
        point3.x, point3.y, 1, 1,
        point3.x, point3.y, 0, 1
      );
    }
  }
}