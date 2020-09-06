class Renderable {
    constructor(position, rotation, scale) {
        this.position = position || new Vector(0, 0, 0);
        this.rotation = rotation || new Angle(0, 0, 0);
        this.scale = scale || new Vector(1, 1, 1);

        this.polygons = [];
    }

    get position() { return this._position; }
    get rotation() { return this._rotation; }
    get scale() { return this._scale; }
    get polygons() { return this._polygons; }

    set position(value) { this._position = value; }
    set rotation(value) { this._rotation = value; }
    set scale(value) { this._scale = value; }
    set polygons(value) { this._polygons = value; }

    /**
     * Transforms this renderable by the given matrices
     * @param  {...any} matrices Any transformation matrices to apply
     */
    transform(...matrices) {
        // First, apply local transformation
        const localToWorld = this.getTransformationMatrix();
        for (const poly of this.polygons) {
            poly.transform(localToWorld, ...matrices);
        }
    }

    /**
     * Draws the transformed version of this renderable to the screen
     * @param {Integer} scrW The width of the screen in pixels
     * @param {Integer} scrH The height of the screen in pixels
     */
    draw(scrW, scrH) {
        for (const poly of this.polygons) {
            poly.draw(scrW, scrH);
        }
    }

    /**
     * Gets the transformation matrix to convert local coordinates to world coordinates
     */
    getTransformationMatrix() {
        const position = this.position.getTranslationMatrix();
        const rotation = this.rotation.getRotationMatrix();
        const scale = this.scale.getScaleMatrix();
        const final = position.multiply(rotation).multiply(scale);
        return final;
    }
}

function makeTestModel() {
    const model = new Renderable();
    model.position = new Vector(0, -5, 0);
    model.rotation = new Angle(0, 0, 0);

    const face = new Polygon();
    face.verts = [new Vector(0, 0, 0), new Vector(10, 0, 0), new Vector(10, 0, 10)];
    face.uvs = [[0, 0], [1, 0], [1, 1]];
    face.texture = assets["placeholder.tex"];
    model.polygons.push(face);
    return model;
}