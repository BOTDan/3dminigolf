/**
 * @class
 * @classdesc A matrix
 */
class Matrix extends Array {
    /**
     * Creates a new Matrix with given w and h
     * @param {Integer} h The height of the matrix
     * @param {Integer} w The width of the matrix
     */
    constructor(h, w) {
        super();
        h = h || 4;
        w = w || h;
        for (let i=0; i<h; i++) {
            this.push([]);
            for (let j=0; j<w; j++) {
                this[i].push(0);
            }
        }
    }

    /**
     * Multiplies 2 matrices and returns a new matrix
     * @param {Matrix} matrix The matrix to multiply by
     */
    multiply(matrix) {
        if (this.length !== matrix[0].length) { return; }
        const out = new Matrix(this.length, matrix[0].length);
        for (let y=0; y<this.length; y++) {
            for (let x=0; x<matrix[0].length; x++) {
                let product = 0;
                for (let i=0; i<this[y].length; i++) {
                    product += this[y][i] * matrix[i][x];
                }
                out[y][x] = product;
            }
        }
        return out;
    }

    /**
     * Creates a copy of this matrix with the given h and w
     * @param {Integer} h The height of the matrix
     * @param {Integer} w The width of the matrix
     */
    resize(h, w) {
        const out = new Matrix(h, w);
        for (let i=0; i<h; i++) {
            for (let j=0; j<w; j++) {
                if (this[i] !== undefined && this[i][j] !== undefined) {
                    out[i][j] = this[i][j];
                } else {
                    out[i][j] = 0;
                }
            }
        }
        return out;
    }

    /**
     * Inverts this matrix
     * Code taken from glmatrix.js
     */
    invert() {
        if (this.length !== 4 || this[0].length !== 4) {
            throw new Error("Only 4x4 Matrixes supported currently");
        }
        const a00 = this[0][0];
        const a01 = this[1][0];
        const a02 = this[2][0];
        const a03 = this[3][0];
        const a10 = this[0][1];
        const a11 = this[1][1];
        const a12 = this[2][1];
        const a13 = this[3][1];
        const a20 = this[0][2];
        const a21 = this[1][2];
        const a22 = this[2][2];
        const a23 = this[3][2];
        const a30 = this[0][3];
        const a31 = this[1][3];
        const a32 = this[2][3];
        const a33 = this[3][3];
        const b00 = a00 * a11 - a01 * a10;
        const b01 = a00 * a12 - a02 * a10;
        const b02 = a00 * a13 - a03 * a10;
        const b03 = a01 * a12 - a02 * a11;
        const b04 = a01 * a13 - a03 * a11;
        const b05 = a02 * a13 - a03 * a12;
        const b06 = a20 * a31 - a21 * a30;
        const b07 = a20 * a32 - a22 * a30;
        const b08 = a20 * a33 - a23 * a30;
        const b09 = a21 * a32 - a22 * a31;
        const b10 = a21 * a33 - a23 * a31;
        const b11 = a22 * a33 - a23 * a32;

        var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (!det) {
          return null;
        }

        det = 1.0 / det;
        const out = new Matrix(4, 4);
        out[0][0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1][0] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2][0] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3][0] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[0][1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[1][1] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[2][1] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[3][1] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[0][2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[1][2] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[2][2] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[3][2] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[0][3] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[1][3] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[2][3] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[3][3] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    }

    /**
     * Transposes this matrix
     * @returns {Matrix} The transposed version of this matrix
     */
    transpose() {
        const out = new Matrix(this[0].length, this.length);
        for (let i=0; i<this.length; i++) {
            for (let j=0; j<this[i].length; j++) {
                out[j][i] = this[i][j];
            }
        }
        return out;
    }

    /**
     * Returns the content of this matrix as a string for printing
     */
    toString() {
        let out = "";
        for (const row of this) {
            if (out !== "") { out += ",\n" }
            out += `[${row.join(", ")}]`;
        }
        return out;
    }

    /**
     * Creates a new, blank transformation matrix
     */
    static transformationMatrix() {
        const matrix = new Matrix(4, 4);
        for (let i=0; i<4; i++) {
            matrix[i][i] = 1;
        }
        return matrix;
    }
}