class Face {
  constructor(vertIds, colour, flipNormal) {
    this.verts = vertIds;
    this.colour = colour || [1, 0, 0, 1];
    this.flipNormal = flipNormal || false;
  }

  get model() { return this._model; }
  get verts() { return this._verts; }
  get colour() { return this._colour; }
  get flipNormal() { return this._flipNormal; }

  set model(value) { this._model = value; }
  set verts(value) { this._verts = value; }
  set colour() { this._colour = value; }
  set flipNormal(value) { this._flipNormal = value; }

  /**
   * Returns a list of Triangles for rendering, representing this face
   * @param {Vector[]} verts The vert list this face uses
   */
  triangulate(verts) {
    const triangles = [];
    for (let i=1; i < this.verts.length - 1; i++) {
      const point1 = verts[this.verts[0]];
      const point2 = verts[this.verts[i]];
      const point3 = verts[this.verts[i+1]];
      const tri = new Triangle(point1, point2, point3, this.colour, this.flipNormal);
      triangles.push(tri);
    }
    return triangles;
  }
}