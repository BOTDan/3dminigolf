/**
 * @class
 * @classdesc Represents an angle in 3D space
 */
class Angle {
    /**
     * Creates a new 3D rotation
     * @param {Number} p Pirch
     * @param {Number} y Yaw
     * @param {Number} r Roll
     */
    constructor(p, y, r) {
        this.p = p || 0;
        this.y = y || 0;
        this.r = r || 0;
    }

    get p() { return this._p; }
    get pitch() { return this.p; }

    get y() { return this._y; }
    get yaw() { return this.y; }

    get r() { return this._r; }
    get roll() { return this.r; }

    set p(value) { this._p = value; }
    set pitch(value) { this.p = value; }

    set y(value) { this._y = value; }
    set yaw(value) { this.y = value; }

    set r(value) { this._r = value; }
    set roll(value) { this.r = value; }

    /**
     * Returns a vector pointing in the direction of this angle
     */
    getForward() {
        const out = new Vector();
        out.x = Math.sin(this.pitch) * Math.cos(this.yaw);
        out.y = - Math.sin(this.yaw);
        out.z = Math.cos(this.yaw) * Math.cos(this.pitch);
        return out;
    }

    /**
     * Returns a vector pointing to the right of this angle
     */
    getRight() {
        const m = this.getRotationMatrix();
        const out = new Vector();
        out.x = - m[0][0];
        out.y = - m[1][0];
        out.z = - m[2][0];
        return out;
    }

    /**
     * Returns a vector pointing up from this angle
     */
    getUp() {
        const m = this.getRotationMatrix();
        const out = new Vector();
        out.x = - m[0][1];
        out.y = - m[1][1];
        out.z = - m[2][1];
        return out;
    }

    /**
     * Returns a 3x3 matrix representing the pitch of this angle
     */
    getPitchMatrix() {
        const matrix = new Matrix(3, 3);
        matrix[0][0] = Math.cos(this.pitch);
        matrix[0][1] = 0;
        matrix[0][2] = Math.sin(this.pitch);

        matrix[1][0] = 0;
        matrix[1][1] = 1;
        matrix[1][2] = 0;

        matrix[2][0] = - Math.sin(this.pitch);
        matrix[2][1] = 0;
        matrix[2][2] = Math.cos(this.pitch);
        return matrix;
    }

    /**
     * Returns a 3x3 matrix representing the yaw of this angle
     */
    getYawMatrix() {
        const matrix = new Matrix(3, 3);
        matrix[0][0] = 1;
        matrix[0][1] = 0;
        matrix[0][2] = 0;

        matrix[1][0] = 0;
        matrix[1][1] = Math.cos(this.yaw);
        matrix[1][2] = - Math.sin(this.yaw);

        matrix[2][0] = 0;
        matrix[2][1] = Math.sin(this.yaw);
        matrix[2][2] = Math.cos(this.yaw);
        return matrix;
    }

    /**
     * Returns a 3x3 matrix representing the roll of this angle
     */
    getRollMatrix() {
        const matrix = new Matrix(3, 3);
        matrix[0][0] = Math.cos(this.roll);
        matrix[0][1] = - Math.sin(this.roll);
        matrix[0][2] = 0;

        matrix[1][0] = Math.sin(this.roll);
        matrix[1][1] = Math.cos(this.roll);
        matrix[1][2] = 0;

        matrix[2][0] = 0;
        matrix[2][1] = 0;
        matrix[2][2] = 1;
        return matrix;
    }

    /**
     * Returns a rotation matrix of this angle
     */
    getRotationMatrix() {
        const pitch = this.getPitchMatrix();
        const yaw = this.getYawMatrix();
        const roll = this.getRollMatrix();

        const combined = pitch.multiply(yaw).multiply(roll);
        const final = combined.resize(4, 4);
        final[3][3] = 1;
        return final;
    }

    /**
     * Returns a rotation matrix of this angle
     */
    /*getRotationMatrix() {
        const matrix = Matrix.transformationMatrix();

        matrix[0][0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        matrix[0][1] = Math.cos(this.yaw) * Math.sin(this.pitch) * Math.sin(this.roll)
                        - Math.sin(this.yaw) * Math.cos(this.roll);
        matrix[0][2] = Math.cos(this.yaw) * Math.sin(this.pitch) * Math.cos(this.roll)
                        + Math.sin(this.yaw) * Math.sin(this.roll);

        matrix[1][0] = Math.sin(this.yaw) * Math.cos(this.pitch);
        matrix[1][1] = Math.sin(this.yaw) * Math.sin(this.pitch) * Math.sin(this.roll)
                        + Math.cos(this.yaw) * Math.cos(this.roll);
        matrix[1][2] = Math.sin(this.yaw) * Math.sin(this.pitch) * Math.cos(this.roll)
                        - Math.cos(this.yaw) * Math.sin(this.roll);

        matrix[2][0] = - Math.sin(this.pitch);
        matrix[2][1] = Math.cos(this.pitch) * Math.sin(this.roll);
        matrix[2][2] = Math.cos(this.pitch) * Math.cos(this.roll);

        return matrix;
    }*/

    /**
     * Returns a string version of this vector
     */
    toString() {
        return `{pitch: ${this.p}, yaw: ${this.y}, roll: ${this.r}}`;
    }
}