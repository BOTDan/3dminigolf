class Polygon2 {
  constructor(vert1, vert2, vert3, colour=[1,1,0,1]) {
    this.verts = [vert1, vert2, vert3];
    this.colour = colour;
  }

  get verts() { return this._verts; }
  set verts(value) { this._verts = value; }

  get colour() { return this._colour; }
  set colour(value) { this._colour = value; }

  project(worldToCamera, projection) {
    const projectedVerts = [];
    for (const vert of this.verts) {
      const finalMatrix = worldToCamera.multiply(projection);
      const vertProjected = vert.multiplyMatrix(finalMatrix);
      projectedVerts.push(vertProjected);
    }
    return projectedVerts;
  }

  isOutside(point) {
    const yes = (point.z > 1 || point.z < 0);
    if (yes) {
      // print(point);
    }
    return yes;
  }

  getLineIntersection(lineStart, lineEnd, planePoint = new Vector(0, 0, 0.1), planeNormal = new Vector(0, 0, 1)) {
    const lineDirection = lineEnd.subtract(lineStart).normalize();
    if (planeNormal.dot(lineDirection) === 0) {
      return null;
    }
    const t = (planeNormal.dot(planePoint) - planeNormal.dot(lineStart)) / planeNormal.dot(lineDirection);
    return lineStart.add(lineDirection.multiply(t));
  }

  clipEdge(point1, point2) {
    if (this.isOutside(point1)) {
      if (this.isOutside(point2)) {
        // Both outside, useless
        return [];
      }
      // Moving from outside to inside
      const point = this.getLineIntersection(point1, point2);
      return [point];
    } else {
      if (this.isOutside(point2)) {
        // Moving from inside to outside
        const point = this.getLineIntersection(point1, point2);
        return [point1, point];
      }
      // Both inside, nothing needs to be done
      return [point1]
    }
  }

  clip(projectedVerts) {
    const clippedVerts = [];
    const point1 = projectedVerts[0];
    const point2 = projectedVerts[1];
    const point3 = projectedVerts[2];
    clippedVerts.push(...this.clipEdge(point1, point2));
    clippedVerts.push(...this.clipEdge(point2, point3));
    clippedVerts.push(...this.clipEdge(point3, point1));
    return clippedVerts;
  }

  draw(clippedVerts, imageW, imageH) {
    const screenVerts = [];
    for (const vert of clippedVerts) {
      const screenX = (vert.x + 1) * 0.5 * imageW;
      const screenY = (1 - (vert.y + 1) * 0.5) * imageH;
      screenVerts.push(new Vector(screenX, screenY, vert.z));
    }
    for (let i=1; i < screenVerts.length - 1; i++) {
      const point1 = screenVerts[0];
      const point2 = screenVerts[i];
      const point3 = screenVerts[i+1];
      _r.color(...this.colour);
      _r.quad(
        point1.x, point1.y, 0, 0,
        point2.x, point2.y, 1, 0,
        point3.x, point3.y, 1, 1,
        point3.x, point3.y, 0, 1
      );
      _r.color(0, 0, 0)
      _r.sprite(point1.x, point1.y, 20, 20)
      _r.color(0, 1, 0);
      _r.sprite(point2.x, point2.y, 15, 15)
      _r.color(1, 0.5, 0.5);
      _r.sprite(point3.x, point3.y, 10, 10)
    }
  }

  render(worldToCamera, projection, imageW, imageH) {
    const projectedVerts = this.project(worldToCamera, projection);
    const clippedVerts = this.clip(projectedVerts);
    this.draw(clippedVerts, imageW, imageH);
  }
}