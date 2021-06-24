class Face {
  constructor(vertIds, colour, flipNormal) {
    this.verts = vertIds;
    this.texture = null;
    this.colour = colour || [1, 1, 1, 1];
    this.flipNormal = flipNormal || false;
    this.zIndex = 0;
  }

  get model() { return this._model; }
  get verts() { return this._verts; }
  get texture() { return this._texture; }
  get colour() { return this._colour; }
  get flipNormal() { return this._flipNormal; }
  get zIndex() { return this._zIndex; }

  set model(value) { this._model = value; }
  set verts(value) { this._verts = value; }
  set texture(value) { this._texture = value; }
  set colour(value) { this._colour = value; }
  set flipNormal(value) { this._flipNormal = value; }
  set zIndex(value) { this._zIndex = value; }

  /**
   * Returns a list of Triangles for rendering, representing this face
   * @param {Vector[]} verts The vert list this face uses
   */
  triangulate(verts, worldVerts, uvs) {
    const triangles = [];
    for (let i=1; i < this.verts.length - 1; i++) {
      const point1 = verts[this.verts[0]];
      const point2 = verts[this.verts[i]];
      const point3 = verts[this.verts[i+1]];
      const tri = new Triangle(point1, point2, point3, this.colour, this.flipNormal, this.zIndex);
      if (worldVerts) {
        tri.worldVerts = [
          worldVerts[this.verts[0]],
          worldVerts[this.verts[i]],
          worldVerts[this.verts[i+1]]
        ];
      }
      if (uvs) {
        tri.uvs = [
          uvs[this.verts[0]],
          uvs[this.verts[i]],
          uvs[this.verts[i+1]]
        ];
      }
      tri.texture = this.texture;
      tri.calcColour = () => { return this.calcColour(tri); };
      triangles.push(tri);
    }
    return triangles;
  }

  /**
   * Function to calculate the draw colour of the triangle.
   * @param {Triangle} triangle The triangle to calculate colour for
   * @returns {Number[]} colour
   */
  calcColour(triangle) {
    return triangle.colour;
  }
}