/**
 * @class
 * @classdesc A 3D vector
 */
class Vector {
    /**
     * Creates a new 3D vector
     * @param {Number} x The x co-ordinate
     * @param {Number} y The y co-ordinate
     * @param {Number} z The z co-ordinate
     */
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    get len() { return this.length(); }

    set x(value) { this._x = value; }
    set y(value) { this._y = value; }
    set z(value) { this._z = value; }
    set len(value) {
        const normal = this.normalize();
        this.x = normal.x * value;
        this.y = normal.y * value;
        this.z = normal.z * value;
    }

    /**
     * Adds a number/vector to this vector
     * @param {Vector||Number} value The vector/number to add
     */
    add(value) {
        if (!(value instanceof Vector)) {
            value = new Vector(value, value, value);  
        }
        return new Vector(
            this.x + value.x,
            this.y + value.y,
            this.z + value.z
        );
    }

    /**
     * Subtracts a number/vector from this vector
     * @param {Vector||Number} value The vector/number to subtract
     */
    subtract(value) {
        if (!(value instanceof Vector)) {
            value = new Vector(value, value, value);  
        }
        return this.add(value.invert());
    }

    /**
     * Multiplies this vector by another number/vector
     * @param {Vector||Number} value The vector/number to multiply by
     */
    multiply(value) {
        if (!(value instanceof Vector)) {
            value = new Vector(value, value, value);  
        }
        return new Vector(
            this.x * value.x,
            this.y * value.y,
            this.z * value.z
        );
    }

    /**
     * Divides this vector by another number/vector
     * @param {Vector||Number} value The vector/number to divide by
     */
    divide(value) {
        if (!(value instanceof Vector)) {
            value = new Vector(value, value, value);  
        }
        return new Vector(
            this.x / value.x,
            this.y / value.y,
            this.z / value.z
        );
    }

    /**
     * Inverts the x, y and z of this vector
     */
    invert() {
        return new Vector(
            -this.x,
            -this.y,
            -this.z
        );
    }

    /**
     * Returns the normalised version of this vector
     */
    normalize() {
        const len = this.length();
        return new Vector(
            this.x / len,
            this.y / len,
            this.z / len
        );
    }

    /**
     * Returns the dot product between this vector and another
     * @param {Vector} value The other vector
     */
    dot(value) {
        return this.x * value.x + this.y * value.y + this.z * value.z;
    }

    /**
     * Returns the cross product between this vector and another
     * @param {Vector} value The other vector
     */
    cross(value) {
        return new Vector(
            this.y * value.z - this.z * value.y,
            this.z * value.x - this.x * value.z,
            this.x * value.y - this.y * value.x
        );
    }

    /**
     * Returns the squares length of this vector
     */
    lengthSqr() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Returns the length of this vector
     */
    length() {
        return Math.sqrt(this.lengthSqr());
    }

    /**
     * Linearly interpolates towards another vector by fraction
     * @param {Vector} to The end position
     * @param {Number} amount The fraction to interpolate by
     */
    lerp(to, amount) {
        const distance = to.subtract(this);
        return new Vector(
            this.x + distance.x * amount,
            this.y + distance.y * amount,
            this.z + distance.z * amount
        );
    }

    /**
     * Reflects this vector by the given normal
     * @param {Vector} normal The normal to reflect by
     */
    reflect(normal) {
        return this.subtract(normal.multiply(this.dot(normal)).multiply(2));
    }

    /**
     * Returns this vector as a translation matrix
     */
    getTranslationMatrix() {
        const matrix = Matrix.transformationMatrix();
        matrix[3][0] = this.x;
        matrix[3][1] = this.y;
        matrix[3][2] = this.z;
        return matrix;
    }

    /**
     * Returns this vector as a scale matrix
     */
    getScaleMatrix() {
        const matrix = Matrix.transformationMatrix();
        matrix[0][0] = this.x;
        matrix[1][1] = this.y;
        matrix[2][2] = this.z;
        return matrix;
    }

    /**
     * Returns a string version of this vector
     */
    toString() {
        return `{x: ${this.x}, y: ${this.y}, z: ${this.z}}`;
    }

    /**
     * Multiplies this vector by the given matrix
     * @param {Matrix} matrix The matrix to multiply by
     */
    multiplyMatrix(matrix) {
        const out = new Vector();
        out.x = this.x * matrix[0][0] + this.y * matrix[1][0] + this.z * matrix[2][0] + matrix[3][0];
        out.y = this.x * matrix[0][1] + this.y * matrix[1][1] + this.z * matrix[2][1] + matrix[3][1];
        out.z = this.x * matrix[0][2] + this.y * matrix[1][2] + this.z * matrix[2][2] + matrix[3][2];
        const w = this.x * matrix[0][3] + this.y * matrix[1][3] + this.z * matrix[2][3] + matrix[3][3];
        if (w !== 1 && w !== 0) {
            out.x /= w;
            out.y /= w;
            out.z /= w;
        }
        return out;
    }

    /**
     * Returns an angle representing this vector
     * @returns {Angle} An angle
     * @see Huge credit to {@link https://stackoverflow.com/a/21627251}
     */
    asAngle() {
        const pitch = util.toDegrees(Math.asin(this.y));
        const yaw = util.toDegrees(Math.atan2(this.x, this.z));
        const out = new Angle(-pitch, yaw, 0);
        return out;
    }
}