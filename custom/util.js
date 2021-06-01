const util = {
  /**
   * Returns the intersection of a line and a plane. Ignores distance currently
   * @param {Vector} lineStart The start of the line
   * @param {Vector} lineEnd The end of the line
   * @param {Vector} planePoint A point on the plane
   * @param {Vector} planeNormal The normal of the plane
   * @returns {Vector} Where the line intersects the plane
   */
  getLineIntersection(lineStart, lineEnd, planePoint = new Vector(0, 0, 0.1), planeNormal = new Vector(0, 0, 1)) {
    const lineDirection = lineEnd.subtract(lineStart).normalize();
    if (planeNormal.dot(lineDirection) === 0) {
      return null;
    }
    const t = (planeNormal.dot(planePoint) - planeNormal.dot(lineStart)) / planeNormal.dot(lineDirection);
    const point = lineStart.add(lineDirection.multiply(t));
    return {
      point: point,
      distance: t,
    }
  },

  /**
   * Returns the normal formed by the first 3 verts given
   * @param {Vector[]} verts The verts to get the normal of
   * @returns The normal formed by the 3 vectors
   */
  findNormal(verts) {
    if (verts.length < 3) {
      return null;
    }
    const a = verts[1].subtract(verts[0]);
    const b = verts[2].subtract(verts[0]);
    let dir = a.cross(b);
    return dir.normalize();
  },

  /**
   * Converts radians to degrees
   * @param {Number} rad Angle in radians
   * @returns {Number} Angle in degrees
   */
  toDegrees(rad) {
    return rad * (180 / Math.PI);
  },

  /**
   * Canvers degrees to radians
   * @param {Number} deg Angle in degrees
   * @returns {Number} Angle in radians
   */
  toRadians(deg) {
    return deg * (Math.PI / 180);
  }
}