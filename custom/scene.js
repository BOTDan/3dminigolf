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
    triangles.sort((a, b) => b.zMin - a.zMin);

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
}