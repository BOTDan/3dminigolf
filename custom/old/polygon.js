class Polygon {
    constructor(verts, colour) {
        this.verts = verts;
        this.colour = colour || [1, 0, 0, 1];

        this._transformedVerts = [];
        this._clippedVerts = [];
        this._screenVerts = [];

        this._normal = null;
        this._nearZ = null;
        this._farZ = null;
        this._avgZ = null;

        this.vertsUpdated();
    }

    get verts() { return this._verts; }
    get colour() { return this._colour; }
    get zMin() { return this._zMin; }
    get zMax() { return this._zMax; }
    get zAvg() { return this._zAvg; }
    get normal() { return this._normal; }
    get flipNormal() { return this._flipNormal; }

    set verts(value) { this._verts = value; }
    set colour(value) { this._colour = value; }
    set flipNormal(value) { this._flipNormal = value; }

    /**
     * Updates internal values. Should be called if verts change.
     */
    vertsUpdated() {
        this._normal = this.calcNormal(this.verts);
    }

    /**
     * Calculates the normal of this polygon. Only accounts for first 3 points.
     * @returns {Vector}
     */
    calcNormal(verts) {
        if (verts.length < 3) {
            return null;
        }
        const a = verts[1].subtract(verts[0]);
        const b = verts[2].subtract(verts[0]);
        let dir = a.cross(b);
        if (this.flipNormal) {
            dir = dir.invert();
        }
        return dir.normalize();
    }

    /**
     * Transforms this polygon's vertices by the given matrices, stored internally.
     * @param  {...any} matrices The matricies to transform by
     */
    transform(...matrices) {
        // const transformedVerts = [];
        // for (const vert of this.verts) {
        //     let transformedVert = vert;
        //     for (const matrix of matrices) {
        //         transformedVert = transformedVert.multiplyMatrix(matrix);
        //     }
        //     transformedVerts.push(transformedVert);
        // }
        // this._transformedVerts = transformedVerts;

        let verts = this.verts;
        for (const matrix of matrices) {
            this._worldVerts = verts;
            const transformedVerts = [];
            for (const vert of verts) {
                transformedVerts.push(vert.multiplyMatrix(matrix));
            }
            verts = transformedVerts;
            this._transformedVerts = transformedVerts;
        }
    }

    /**
     * Clips the internal transformed verts to the camera space
     * @param {Camera} camera The camera to clip to
     */
    clip(camera) {
        let clippedVerts = [];
        for (let i=0; i < this._transformedVerts.length - 1; i++) {
            const point1 = this._transformedVerts[i];
            const point2 = this._transformedVerts[i+1];
            clippedVerts.push(...clipEdge(point1, point2, camera.near));
        }
        const point1 = this._transformedVerts[this._transformedVerts.length-1];
        const point2 = this._transformedVerts[0];
        clippedVerts.push(...clipEdge(point1, point2, camera.near));
        // const clippedNormal = this.calcNormal(clippedVerts);
        // if (clippedNormal === null || clippedNormal.z > 0) {
        //     //clippedVerts = [];
        // }
        if (this.shouldCull(camera, clippedVerts)) {
            clippedVerts = [];
        }
        this._clippedVerts = clippedVerts;

        this.updateZValues();
    }

    shouldCull(camera, clippedVerts) {
        const polygonNormal = this.calcNormal(clippedVerts);
        if (polygonNormal === null) { return true; }
        // const point = clippedVerts[0].invert();
        const dot = new Vector(0, 0, -1).dot(polygonNormal);
        // const cameraToTriangle = this._worldVerts[0].subtract(camera.position);
        // const dot = cameraToTriangle.dot(polygonNormal);
        return (dot < 0);
    }

    /**
     * Converts the clipped coordinates to screen coordinates
     * @param {Number} width The screen width
     * @param {Number} height The screen height
     */
    screen(width=_m.width, height=_m.height) {
        const screenVerts = [];
        for (const vert of this._clippedVerts) {
            const screenX = (vert.x + 1) * 0.5 * width;
            const screenY = (1 - (vert.y + 1) * 0.5) * height;
            screenVerts.push(new Vector(screenX, screenY, vert.z));
        }
        this._screenVerts = screenVerts;
    }

    /**
     * Draws this polygon to the screen
     */
    draw() {
        for (let i=1; i < this._screenVerts.length - 1; i++) {
            const point1 = this._screenVerts[0];
            const point2 = this._screenVerts[i];
            const point3 = this._screenVerts[i+1];
            _r.color(...this.calcColour());
            _r.quad(
              point1.x, point1.y, 0, 0,
              point2.x, point2.y, 1, 0,
              point3.x, point3.y, 1, 1,
              point3.x, point3.y, 0, 1
            );
        }
    }

    /**
     * Draws the wireframe of this polygon to the screen
     */
    drawWireframe() {
        for (let i=1; i < this._screenVerts.length - 1; i++) {
            const point1 = this._screenVerts[0];
            const point2 = this._screenVerts[i];
            const point3 = this._screenVerts[i+1];
            _r.color(0, 1, 1, 1);
            drawutil.line(point1.x, point1.y, point2.x, point2.y);
            drawutil.line(point3.x, point3.y, point2.x, point2.y);
        }
        if (this._screenVerts.length > 2) {
            const point1 = this._screenVerts[0];
            const point2 = this._screenVerts[this._screenVerts.length-1];
            drawutil.line(point1.x, point1.y, point2.x, point2.y);
        }
    }

    /**
     * Draws the vertex number at the vertex
     */
    drawVertexNumbers() {
        this._screenVerts.forEach((screenPos, i) => {
            _r.color(0, 1, 1, 1);
            _r.sprite(screenPos.x, screenPos.y, 20, 20);
            _r.color(0, 0, 0, 1);
            GameBase.Text.SetFont("Mplus1m Bold");
            GameBase.Text.SetSize(20);
            GameBase.Text.DrawText(screenPos.x, screenPos.y, `${i}`, 1, 1);
        });
    }

    /**
     * Updates the internal z-values after clipping is done
     */
    updateZValues() {
        const zValues = this._clippedVerts.map(vert => vert.z);
        this._zMin = Math.min(...zValues);
        this._zMax = Math.max(...zValues);
        this._zAvg = zValues.reduce((acc, z) => acc + z, 0) / zValues.length;
    }

    /**
     * Function used to override the colour of this polygon
     * Default returns this.colour
     */
    calcColour() {
        return this.colour;
    }
}

/**
 * Returns if the given point is behind the camera
 * @param {Vector} point The point
 * @param {Camera} camera The camera
 * @returns {Boolean}
 */
function isPointOutside(point, camera) {
    return (point.z > 1 || point.z < 0);
}

/**
 * Returns the intersection of a line and a plane. Ignores distance currently
 * @param {Vector} lineStart The start of the line
 * @param {Vector} lineEnd The end of the line
 * @param {Vector} planePoint A point on the plane
 * @param {Vector} planeNormal The normal of the plane
 * @returns {Vector} Where the line intersects the plane
 */
function getLineIntersection(lineStart, lineEnd, planePoint = new Vector(0, 0, 0.1), planeNormal = new Vector(0, 0, 1)) {
    const result = util.getLineIntersection(lineStart, lineEnd, planePoint, planeNormal);
    return result.point || null;
}

/**
 * Clips the given edge
 * @param {Vector} point1 The start of the edge
 * @param {Vector} point2 The end of the edge
 * @param {Number} near The near clipping plane
 * @returns 
 */
function clipEdge(point1, point2, near=0) {
    const planePoint = new Vector(0, 0, near);
    if (this.isPointOutside(point1)) {
        if (this.isPointOutside(point2)) {
            // Both outside, useless
            return [];
        }
        // Moving from outside to inside
        const point = this.getLineIntersection(point1, point2, planePoint);
        return [point];
    } else {
        if (this.isPointOutside(point2)) {
            // Moving from inside to outside
            const point = this.getLineIntersection(point1, point2, planePoint);
            return [point1, point];
        }
        // Both inside, nothing needs to be done
        return [point1]
    }
}