class Polygon {
    /**
     * Creates a new polygon
     */
    constructor(verts, colour) {
        this.verts = verts || [];
        this.texture = undefined;
        this.colour = colour || [1,1,0,1];
    }

    get verts() {  return this._verts; }
    get texture() { return this._texture; }

    set verts(value) { this._verts = value; }
    set texture(value) { this._texture = value; }

    /**
     * Transforms this polygon by the given matrices
     * @param  {...Matrix} matrices Any transformation matrices to apply
     */
    transform(...matrices) {
        const finalVerts = [];
        for (const vert of this.verts) {
            let result = vert;
            for (const matrix of matrices) {
                result = result.multiplyMatrix(matrix);
            }
            finalVerts.push(result);
        }
        return new Polygon(finalVerts, this.colour);
    }

    /**
     * Draws the transformed version of this polygon to the screen
     * @param {Integer} scrW The width of the screen in pixels
     * @param {Integer} scrH The height of the screen in pixels
     */
    draw(scrW, scrH) {
        for (let i=0; i<this.transformedVerts.length-2; i++) {
            const verts = [this.transformedVerts[0],
            this.transformedVerts[i+1],
            this.transformedVerts[i+2]];
            const uvs = [[0,0], [1,0], [1,1]];

            const finalVerts = [];
            for (const vert of verts) {
                const screenX = (vert.x + 1) * 0.5 * scrW;
                const screenY = (1 - (vert.y + 1) * 0.5) * scrH;
                finalVerts.push([screenX, screenY]);
            }
            
            _r.color(0, 1, 1, 1);
            _r.quad(finalVerts[0][0], finalVerts[0][1], uvs[0][0], uvs[0][1],
                finalVerts[1][0], finalVerts[1][1], uvs[1][0], uvs[1][1],
                finalVerts[2][0], finalVerts[2][1], uvs[2][0], uvs[2][1],
                finalVerts[2][0], finalVerts[2][1], uvs[2][0], uvs[2][1],
                this.texture
            );
        }
    }

    toString() {
        return `[${this.verts.join(",")}]`;
    }
}