class Matrix extends Array {
    /**
     * Creates a new Matrix with given w and h
     * @param {Integer} w The width of the matrix
     * @param {Integer} h The height of the matrix
     */
    constructor(w, h) {
        super();
        w = w || 4;
        h = h || w;
        for (let i=0; i<w; i++) {
            this.push([]);
            for (let j=0; j<h; j++) {
                this[i].push(0);
            }
        }
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