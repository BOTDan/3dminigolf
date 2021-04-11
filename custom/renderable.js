class Renderable {
    constructor(position, rotation, scale, polygons) {
        this.position = position || new Vector(0, 0, 0);
        this.rotation = rotation || new Angle(0, 0, 0);
        this.scale = scale || new Vector(1, 1, 1);

        this.polygons = polygons || [];
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
        const finalPolys = [];
        for (const poly of this.polygons) {
            finalPolys.push(poly.transform(localToWorld, ...matrices));
        }
        return finalPolys;
    }

    /**
     * Returns this renderable's polygons, translated to world coordinates
     */
    getWorldPolygons() {
        const localToWorld = this.getTransformationMatrix();
        const finalPolys = [];
        for (const poly of this.polygons) {
            finalPolys.push(poly.transform(localToWorld));
        }
        return finalPolys;
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