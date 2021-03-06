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
  },

  /**
   * Converts a 3D position to a 2D position relative to a plane
   * @param {Vector} point The point to convert
   * @param {Vector} planeOrigin The center of the plane
   * @param {Angle} planeAngle The angles of the plane
   * @returns {Vector} The 2D position
   */
  pointToPlane(point, planeOrigin, planeAngle) {
    const originX = planeAngle.getRight().dot(planeOrigin);
    const originY = planeAngle.getUp().dot(planeOrigin);
    const x = planeAngle.getRight().dot(point);
    const y = planeAngle.getUp().dot(point);
    return new Vector(x - originX, y - originY, 0);
  },

  /**
   * Returns a closest point along the given line to the given point
   * @param {Vector} point The point
   * @param {Vector} lineStart The start position of the line
   * @param {Vector} lineEnd The end position of the line
   * @returns {Vector} The closest point
   */
  closestPointOnLine(point, lineStart, lineEnd, mustContain=false) {
    const lineDir = lineEnd.subtract(lineStart).normalize();
    const v = point.subtract(lineStart);
    const t = lineDir.dot(v);
    const len = lineStart.distanceSqr(lineEnd);
    if (mustContain && (t<0 || (t*t) > len)) {
      return null;
    }
    const nearestPoint = lineStart.add(lineDir.multiply(t));
    return nearestPoint;
  },

  /**
   * Checks if 2 AABBs overlap
   * @param {min: Vector, max: Vector} a The min and max of the first AABB
   * @param {min: Vector, max: Vector} b The min and max of the second AABB
   * @returns {Boolean} True if overlap
   */
  checkOverlapAABB(a, b) {
    const xOverlap = (a.max.x >= b.min.x && b.max.x >= a.min.x);
    const yOverlap = (a.max.y >= b.min.y && b.max.y >= a.min.y);
    const zOverlap = (a.max.z >= b.min.z && b.max.z >= a.min.z);
    const result = (xOverlap && yOverlap && zOverlap);
    return result;
  },

  /**
   * Converts an RGB(A) colour to normalised colour
   * @param {Number} r Red value
   * @param {Number} g Green value
   * @param {Number} b Blue value
   * @param {Number} a Alpha value
   * @returns {number[]} A colour object with values from 0-1
   */
  RGBtoColour(r, g, b, a=255) {
    return [
      r/255,
      g/255,
      b/255,
      a/255
    ];
  }
}