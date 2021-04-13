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
    return lineStart.add(lineDirection.multiply(t));
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
  }
}