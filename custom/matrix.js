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