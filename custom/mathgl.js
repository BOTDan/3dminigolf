(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('gl-matrix/vec2'), require('gl-matrix/vec3'), require('gl-matrix/mat3'), require('gl-matrix/mat4'), require('gl-matrix/vec4'), require('gl-matrix/quat')) :
  typeof define === 'function' && define.amd ? define(['exports', 'gl-matrix/vec2', 'gl-matrix/vec3', 'gl-matrix/mat3', 'gl-matrix/mat4', 'gl-matrix/vec4', 'gl-matrix/quat'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mathgl = {}, global.glMatrix.vec2, global.glMatrix.vec3, global.glMatrix.mat3, global.glMatrix.mat4, global.glMatrix.vec4, global.glMatrix.quat));
}(this, (function (exports, vec2, vec3, mat3, mat4, vec4, quat) { 'use strict';

  function assert(condition, message) {
    if (!condition) {
      throw new Error(`math.gl assertion ${message}`);
    }
  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  const RADIANS_TO_DEGREES = 1 / Math.PI * 180;
  const DEGREES_TO_RADIANS = 1 / 180 * Math.PI; // TODO - remove

  /* eslint-disable no-shadow */

  const config = {};
  config.EPSILON = 1e-12;
  config.debug = false;
  config.precision = 4;
  config.printTypes = false;
  config.printDegrees = false;
  config.printRowMajor = true;
  function configure(options = {}) {
    // Only copy existing keys
    for (const key in options) {
      assert(key in config);
      config[key] = options[key];
    }

    return config;
  }

  function round(value) {
    return Math.round(value / config.EPSILON) * config.EPSILON;
  }

  function formatValue(value, {
    precision = config.precision || 4
  } = {}) {
    value = round(value); // get rid of trailing zeros

    return `${parseFloat(value.toPrecision(precision))}`;
  } // Returns true if value is either an array or a typed array
  // Note: does not return true for ArrayBuffers and DataViews

  function isArray(value) {
    return Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView);
  } // If the array has a clone function, calls it, otherwise returns a copy

  function duplicateArray(array) {
    return array.clone ? array.clone() : new Array(array.length);
  }

  function clone(array) {
    return array.clone ? array.clone() : new Array(...array);
  } // If the argument value is an array, applies the func element wise,
  // otherwise applies func to the argument value

  function map$1(value, func, result) {
    if (isArray(value)) {
      result = result || duplicateArray(value);

      for (let i = 0; i < result.length && i < value.length; ++i) {
        result[i] = func(value[i], i, result);
      }

      return result;
    }

    return func(value);
  }

  function toRadians(degrees) {
    return radians(degrees);
  }
  function toDegrees(radians) {
    return degrees(radians);
  } //
  // GLSL math function equivalents
  // Works on both single values and vectors
  //

  function radians(degrees, result) {
    return map$1(degrees, degrees => degrees * DEGREES_TO_RADIANS, result);
  }
  function degrees(radians, result) {
    return map$1(radians, radians => radians * RADIANS_TO_DEGREES, result);
  } // GLSL equivalent: Works on single values and vectors

  function sin(radians) {
    return map$1(radians, angle => Math.sin(angle));
  } // GLSL equivalent: Works on single values and vectors

  function cos(radians) {
    return map$1(radians, angle => Math.cos(angle));
  } // GLSL equivalent: Works on single values and vectors

  function tan(radians) {
    return map$1(radians, angle => Math.tan(angle));
  } // GLSL equivalent: Works on single values and vectors

  function asin(radians) {
    return map$1(radians, angle => Math.asin(angle));
  } // GLSL equivalent: Works on single values and vectors

  function acos(radians) {
    return map$1(radians, angle => Math.acos(angle));
  } // GLSL equivalent: Works on single values and vectors

  function atan(radians) {
    return map$1(radians, angle => Math.atan(angle));
  }
  function clamp(value, min, max) {
    return map$1(value, value => Math.max(min, Math.min(max, value)));
  } // Interpolate between two numbers or two arrays

  function lerp(a, b, t) {
    if (isArray(a)) {
      return a.map((ai, i) => lerp(ai, b[i], t));
    }

    return t * b + (1 - t) * a;
  } // eslint-disable-next-line complexity

  function equals(a, b, epsilon) {
    const oldEpsilon = config.EPSILON;

    if (epsilon) {
      config.EPSILON = epsilon;
    }

    try {
      if (a === b) {
        return true;
      }

      if (isArray(a) && isArray(b)) {
        if (a.length !== b.length) {
          return false;
        }

        for (let i = 0; i < a.length; ++i) {
          // eslint-disable-next-line max-depth
          if (!equals(a[i], b[i])) {
            return false;
          }
        }

        return true;
      }

      if (a && a.equals) {
        return a.equals(b);
      }

      if (b && b.equals) {
        return b.equals(a);
      }

      if (Number.isFinite(a) && Number.isFinite(b)) {
        return Math.abs(a - b) <= config.EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
      }

      return false;
    } finally {
      config.EPSILON = oldEpsilon;
    }
  } // eslint-disable-next-line complexity

  function exactEquals(a, b) {
    if (a === b) {
      return true;
    }

    if (a && typeof a === 'object' && b && typeof b === 'object') {
      if (a.constructor !== b.constructor) {
        return false;
      }

      if (a.exactEquals) {
        return a.exactEquals(b);
      }
    }

    if (isArray(a) && isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }

      for (let i = 0; i < a.length; ++i) {
        if (!exactEquals(a[i], b[i])) {
          return false;
        }
      }

      return true;
    }

    return false;
  }
  function withEpsilon(EPSILON, func) {
    const oldPrecision = config.EPSILON;
    config.EPSILON = EPSILON;
    let value;

    try {
      value = func();
    } finally {
      config.EPSILON = oldPrecision;
    }

    return value;
  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  class MathArray extends Array {
    // Defined by derived class
    get ELEMENTS() {
      assert(false);
      return 0;
    } // Defined by derived class


    get RANK() {
      assert(false);
      return 0;
    }

    clone() {
      // @ts-ignore error TS2351: Cannot use 'new' with an expression whose type lacks a call or construct signature.
      return new this.constructor().copy(this);
    }

    from(arrayOrObject) {
      // @ts-ignore error TS2339: Property 'copy' does not exist on type 'MathArray'.
      return Array.isArray(arrayOrObject) ? this.copy(arrayOrObject) : this.fromObject(arrayOrObject);
    }

    fromArray(array, offset = 0) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = array[i + offset];
      }

      return this.check();
    }

    to(arrayOrObject) {
      if (arrayOrObject === this) {
        return this;
      } // @ts-ignore error TS2339: Property 'toObject' does not exist on type 'MathArray'.


      return isArray(arrayOrObject) ? this.toArray(arrayOrObject) : this.toObject(arrayOrObject);
    }

    toTarget(target) {
      return target ? this.to(target) : this;
    }

    toArray(array = [], offset = 0) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        array[offset + i] = this[i];
      }

      return array;
    }

    toFloat32Array() {
      return new Float32Array(this);
    }

    toString() {
      return this.formatString(config);
    }

    formatString(opts) {
      let string = '';

      for (let i = 0; i < this.ELEMENTS; ++i) {
        string += (i > 0 ? ', ' : '') + formatValue(this[i], opts);
      }

      return `${opts.printTypes ? this.constructor.name : ''}[${string}]`;
    }

    equals(array) {
      if (!array || this.length !== array.length) {
        return false;
      }

      for (let i = 0; i < this.ELEMENTS; ++i) {
        if (!equals(this[i], array[i])) {
          return false;
        }
      }

      return true;
    }

    exactEquals(array) {
      if (!array || this.length !== array.length) {
        return false;
      }

      for (let i = 0; i < this.ELEMENTS; ++i) {
        if (this[i] !== array[i]) {
          return false;
        }
      }

      return true;
    } // Modifiers


    negate() {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = -this[i];
      }

      return this.check();
    }

    lerp(a, b, t) {
      if (t === undefined) {
        t = b;
        b = a;
        a = this; // eslint-disable-line
      }

      for (let i = 0; i < this.ELEMENTS; ++i) {
        const ai = a[i];
        this[i] = ai + t * (b[i] - ai);
      }

      return this.check();
    }

    min(vector) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(vector[i], this[i]);
      }

      return this.check();
    }

    max(vector) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.max(vector[i], this[i]);
      }

      return this.check();
    }

    clamp(minVector, maxVector) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], minVector[i]), maxVector[i]);
      }

      return this.check();
    }

    add(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] += vector[i];
        }
      }

      return this.check();
    }

    subtract(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] -= vector[i];
        }
      }

      return this.check();
    }

    scale(scale) {
      if (Array.isArray(scale)) {
        // @ts-ignore error TS2339: Property 'multiply' does not exist on type 'MathArray'.
        return this.multiply(scale);
      }

      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= scale;
      }

      return this.check();
    } // three.js compatibility


    sub(a) {
      return this.subtract(a);
    }

    setScalar(a) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = a;
      }

      return this.check();
    }

    addScalar(a) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] += a;
      }

      return this.check();
    }

    subScalar(a) {
      return this.addScalar(-a);
    }

    multiplyScalar(scalar) {
      // Multiplies all elements
      // `Matrix4.scale` only scales its 3x3 "minor"
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] *= scalar;
      }

      return this.check();
    }

    divideScalar(a) {
      return this.scale(1 / a);
    }

    clampScalar(min, max) {
      for (let i = 0; i < this.ELEMENTS; ++i) {
        this[i] = Math.min(Math.max(this[i], min), max);
      }

      return this.check();
    } // Cesium compatibility


    multiplyByScalar(scalar) {
      return this.scale(scalar);
    } // THREE.js compatibility


    get elements() {
      return this;
    } // Debug checks


    check() {
      if (config.debug && !this.validate()) {
        throw new Error(`math.gl: ${this.constructor.name} some fields set to invalid numbers'`);
      }

      return this;
    }

    validate() {
      let valid = this.length === this.ELEMENTS;

      for (let i = 0; i < this.ELEMENTS; ++i) {
        valid = valid && Number.isFinite(this[i]);
      }

      return valid;
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  function validateVector(v, length) {
    if (v.length !== length) {
      return false;
    } // Could be arguments "array" (v.every not availasble)


    for (let i = 0; i < v.length; ++i) {
      if (!Number.isFinite(v[i])) {
        return false;
      }
    }

    return true;
  }
  function checkNumber(value) {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid number ${value}`);
    }

    return value;
  }
  function checkVector(v, length, callerName = '') {
    if (config.debug && !validateVector(v, length)) {
      throw new Error(`math.gl: ${callerName} some fields set to invalid numbers'`);
    }

    return v;
  }
  const map = {};
  function deprecated(method, version) {
    if (!map[method]) {
      map[method] = true; // eslint-disable-next-line

      console.warn(`${method} has been removed in version ${version}, see upgrade guide for more information`);
    }
  }

  class Vector extends MathArray {
    // VIRTUAL METHODS
    copy(vector) {
      assert(false);
      return this;
    } // ACCESSORS


    get x() {
      return this[0];
    }

    set x(value) {
      this[0] = checkNumber(value);
    }

    get y() {
      return this[1];
    }

    set y(value) {
      this[1] = checkNumber(value);
    } // NOTE: `length` is a reserved word for Arrays, so we can't use `v.length()`
    // Offer `len` and `magnitude`


    len() {
      return Math.sqrt(this.lengthSquared());
    }

    magnitude() {
      return this.len();
    }

    lengthSquared() {
      let length = 0;

      for (let i = 0; i < this.ELEMENTS; ++i) {
        length += this[i] * this[i];
      }

      return length;
    }

    magnitudeSquared() {
      return this.lengthSquared();
    }

    distance(mathArray) {
      return Math.sqrt(this.distanceSquared(mathArray));
    }

    distanceSquared(mathArray) {
      let length = 0;

      for (let i = 0; i < this.ELEMENTS; ++i) {
        const dist = this[i] - mathArray[i];
        length += dist * dist;
      }

      return checkNumber(length);
    }

    dot(mathArray) {
      let product = 0;

      for (let i = 0; i < this.ELEMENTS; ++i) {
        product += this[i] * mathArray[i];
      }

      return checkNumber(product);
    } // MODIFIERS


    normalize() {
      const length = this.magnitude();

      if (length !== 0) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= length;
        }
      }

      return this.check();
    } // negate() {
    //   for (let i = 0; i < this.ELEMENTS; ++i) {
    //     this[i] = -this[i];
    //   }
    //   return this.check();
    // }
    // inverse() {
    //   for (let i = 0; i < this.ELEMENTS; ++i) {
    //     this[i] = 1 / this[i];
    //   }
    //   return this.check();
    // }


    multiply(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] *= vector[i];
        }
      }

      return this.check();
    }

    divide(...vectors) {
      for (const vector of vectors) {
        for (let i = 0; i < this.ELEMENTS; ++i) {
          this[i] /= vector[i];
        }
      }

      return this.check();
    } // THREE.js compatibility


    lengthSq() {
      return this.lengthSquared();
    }

    distanceTo(vector) {
      return this.distance(vector);
    }

    distanceToSquared(vector) {
      return this.distanceSquared(vector);
    }

    getComponent(i) {
      assert(i >= 0 && i < this.ELEMENTS, 'index is out of range');
      return checkNumber(this[i]);
    }

    setComponent(i, value) {
      assert(i >= 0 && i < this.ELEMENTS, 'index is out of range');
      this[i] = value;
      return this.check();
    }

    addVectors(a, b) {
      return this.copy(a).add(b);
    }

    subVectors(a, b) {
      return this.copy(a).subtract(b);
    }

    multiplyVectors(a, b) {
      return this.copy(a).multiply(b);
    }

    addScaledVector(a, b) {
      // @ts-ignore error TS2351: Cannot use 'new' with an expression whose type lacks a call or construct signature.
      return this.add(new this.constructor(a).multiplyScalar(b));
    }

  }

  // vec2 additions
  function vec2_transformMat4AsVector(out, a, m) {
    const x = a[0];
    const y = a[1];
    const w = m[3] * x + m[7] * y || 1.0;
    out[0] = (m[0] * x + m[4] * y) / w;
    out[1] = (m[1] * x + m[5] * y) / w;
    return out;
  } // vec3 additions
  // Transform as vector, only uses 3x3 minor matrix

  function vec3_transformMat4AsVector(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    const w = m[3] * x + m[7] * y + m[11] * z || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
    return out;
  }
  function vec3_transformMat2(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    out[2] = a[2];
    return out;
  } // vec4 additions

  function vec4_transformMat2(out, a, m) {
    const x = a[0];
    const y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    out[2] = a[2];
    out[3] = a[3];
    return out;
  }
  function vec4_transformMat3(out, a, m) {
    const x = a[0];
    const y = a[1];
    const z = a[2];
    out[0] = m[0] * x + m[3] * y + m[6] * z;
    out[1] = m[1] * x + m[4] * y + m[7] * z;
    out[2] = m[2] * x + m[5] * y + m[8] * z;
    out[3] = a[3];
    return out;
  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  class Vector2 extends Vector {
    // Creates a new, empty vec2
    constructor(x = 0, y = 0) {
      // PERF NOTE: initialize elements as double precision numbers
      super(2); // -0, -0);

      if (isArray(x) && arguments.length === 1) {
        this.copy(x);
      } else {
        if (config.debug) {
          checkNumber(x);
          checkNumber(y);
        }

        this[0] = x;
        this[1] = y;
      }
    }

    set(x, y) {
      this[0] = x;
      this[1] = y;
      return this.check();
    }

    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      return this.check();
    }

    fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
      }

      this[0] = object.x;
      this[1] = object.y;
      return this.check();
    }

    toObject(object) {
      object.x = this[0];
      object.y = this[1];
      return object;
    } // Getters/setters


    get ELEMENTS() {
      return 2;
    } // x,y inherited from Vector


    horizontalAngle() {
      return Math.atan2(this.y, this.x);
    }

    verticalAngle() {
      return Math.atan2(this.x, this.y);
    } // Transforms


    transform(matrix4) {
      return this.transformAsPoint(matrix4);
    } // transforms as point (4th component is implicitly 1)


    transformAsPoint(matrix4) {
      vec2.transformMat4(this, this, matrix4);
      return this.check();
    } // transforms as vector  (4th component is implicitly 0, ignores translation. slightly faster)


    transformAsVector(matrix4) {
      vec2_transformMat4AsVector(this, this, matrix4);
      return this.check();
    }

    transformByMatrix3(matrix3) {
      vec2.transformMat3(this, this, matrix3);
      return this.check();
    }

    transformByMatrix2x3(matrix2x3) {
      vec2.transformMat2d(this, this, matrix2x3);
      return this.check();
    }

    transformByMatrix2(matrix2) {
      vec2.transformMat2(this, this, matrix2);
      return this.check();
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  const ORIGIN = [0, 0, 0];
  const constants$3 = {};
  class Vector3 extends Vector {
    static get ZERO() {
      return constants$3.ZERO = constants$3.ZERO || Object.freeze(new Vector3(0, 0, 0, 0));
    }
    /**
     * @class
     * @param {Number | [Number, Number, Number]} x
     * @param {Number} y - rotation around X (latitude)
     * @param {Number} z - rotation around X (latitude)
     */


    constructor(x = 0, y = 0, z = 0) {
      // PERF NOTE: initialize elements as double precision numbers
      super(-0, -0, -0);

      if (arguments.length === 1 && isArray(x)) {
        this.copy(x);
      } else {
        // this.set(x, y, z);
        if (config.debug) {
          checkNumber(x);
          checkNumber(y);
          checkNumber(z);
        } // @ts-ignore TS2412: Property '0' of type 'number | [number, number, number]' is not assignable to numeric index type 'number'


        this[0] = x;
        this[1] = y;
        this[2] = z;
      }
    }

    set(x, y, z) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      return this.check();
    }

    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      return this.check();
    }

    fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
        checkNumber(object.z);
      }

      this[0] = object.x;
      this[1] = object.y;
      this[2] = object.z;
      return this.check();
    }

    toObject(object) {
      object.x = this[0];
      object.y = this[1];
      object.z = this[2];
      return object;
    } // Getters/setters

    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */


    get ELEMENTS() {
      return 3;
    } // x,y inherited from Vector


    get z() {
      return this[2];
    }

    set z(value) {
      this[2] = checkNumber(value);
    }
    /* eslint-enable no-multi-spaces, brace-style, no-return-assign */


    angle(vector) {
      return vec3.angle(this, vector);
    } // MODIFIERS


    cross(vector) {
      vec3.cross(this, this, vector);
      return this.check();
    }

    rotateX({
      radians,
      origin = ORIGIN
    }) {
      vec3.rotateX(this, this, origin, radians);
      return this.check();
    }

    rotateY({
      radians,
      origin = ORIGIN
    }) {
      vec3.rotateY(this, this, origin, radians);
      return this.check();
    }

    rotateZ({
      radians,
      origin = ORIGIN
    }) {
      vec3.rotateZ(this, this, origin, radians);
      return this.check();
    } // Transforms
    // transforms as point (4th component is implicitly 1)


    transform(matrix4) {
      return this.transformAsPoint(matrix4);
    } // transforms as point (4th component is implicitly 1)


    transformAsPoint(matrix4) {
      vec3.transformMat4(this, this, matrix4);
      return this.check();
    } // transforms as vector  (4th component is implicitly 0, ignores translation. slightly faster)


    transformAsVector(matrix4) {
      vec3_transformMat4AsVector(this, this, matrix4);
      return this.check();
    }

    transformByMatrix3(matrix3) {
      vec3.transformMat3(this, this, matrix3);
      return this.check();
    }

    transformByMatrix2(matrix2) {
      vec3_transformMat2(this, this, matrix2);
      return this.check();
    }

    transformByQuaternion(quaternion) {
      vec3.transformQuat(this, this, quaternion);
      return this.check();
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  const constants$2 = {};
  class Vector4 extends Vector {
    static get ZERO() {
      return constants$2.ZERO = constants$2.ZERO || Object.freeze(new Vector4(0, 0, 0, 0));
    }

    constructor(x = 0, y = 0, z = 0, w = 0) {
      // PERF NOTE: initialize elements as double precision numbers
      super(-0, -0, -0, -0);

      if (isArray(x) && arguments.length === 1) {
        this.copy(x);
      } else {
        // this.set(x, y, z, w);
        if (config.debug) {
          checkNumber(x);
          checkNumber(y);
          checkNumber(z);
          checkNumber(w);
        }

        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
      }
    }

    set(x, y, z, w) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this.check();
    }

    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      return this.check();
    }

    fromObject(object) {
      if (config.debug) {
        checkNumber(object.x);
        checkNumber(object.y);
        checkNumber(object.z);
        checkNumber(object.w);
      }

      this[0] = object.x;
      this[1] = object.y;
      this[2] = object.z;
      this[3] = object.w;
      return this;
    }

    toObject(object) {
      object.x = this[0];
      object.y = this[1];
      object.z = this[2];
      object.w = this[3];
      return object;
    } // Getters/setters

    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */


    get ELEMENTS() {
      return 4;
    } // x,y inherited from Vector


    get z() {
      return this[2];
    }

    set z(value) {
      this[2] = checkNumber(value);
    }

    get w() {
      return this[3];
    }

    set w(value) {
      this[3] = checkNumber(value);
    }
    /* eslint-enable no-multi-spaces, brace-style, no-return-assign */


    transform(matrix4) {
      vec3.transformMat4(this, this, matrix4);
      return this.check();
    }

    transformByMatrix3(matrix3) {
      vec4_transformMat3(this, this, matrix3);
      return this.check();
    }

    transformByMatrix2(matrix2) {
      vec4_transformMat2(this, this, matrix2);
      return this.check();
    }

    transformByQuaternion(quaternion) {
      vec3.transformQuat(this, this, quaternion);
      return this.check();
    } // three.js compatibility


    applyMatrix4(m) {
      m.transform(this, this);
      return this;
    }

  }

  class Matrix extends MathArray {
    // fromObject(object) {
    //   const array = object.elements;
    //   return this.fromRowMajor(array);
    // }
    // toObject(object) {
    //   const array = object.elements;
    //   this.toRowMajor(array);
    //   return object;
    // }
    toString() {
      let string = '[';

      if (config.printRowMajor) {
        string += 'row-major:';

        for (let row = 0; row < this.RANK; ++row) {
          for (let col = 0; col < this.RANK; ++col) {
            string += ` ${this[col * this.RANK + row]}`;
          }
        }
      } else {
        string += 'column-major:';

        for (let i = 0; i < this.ELEMENTS; ++i) {
          string += ` ${this[i]}`;
        }
      }

      string += ']';
      return string;
    }

    getElementIndex(row, col) {
      return col * this.RANK + row;
    } // By default assumes row major indices


    getElement(row, col) {
      return this[col * this.RANK + row];
    } // By default assumes row major indices


    setElement(row, col, value) {
      this[col * this.RANK + row] = checkNumber(value);
      return this;
    }

    getColumn(columnIndex, result = new Array(this.RANK).fill(-0)) {
      const firstIndex = columnIndex * this.RANK;

      for (let i = 0; i < this.RANK; ++i) {
        result[i] = this[firstIndex + i];
      }

      return result;
    }

    setColumn(columnIndex, columnVector) {
      const firstIndex = columnIndex * this.RANK;

      for (let i = 0; i < this.RANK; ++i) {
        this[firstIndex + i] = columnVector[i];
      }

      return this;
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  const IDENTITY$1 = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  const ZERO$1 = Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const INDICES$1 = Object.freeze({
    COL0ROW0: 0,
    COL0ROW1: 1,
    COL0ROW2: 2,
    COL1ROW0: 3,
    COL1ROW1: 4,
    COL1ROW2: 5,
    COL2ROW0: 6,
    COL2ROW1: 7,
    COL2ROW2: 8
  });
  const constants$1 = {};
  class Matrix3 extends Matrix {
    static get IDENTITY() {
      constants$1.IDENTITY = constants$1.IDENTITY || Object.freeze(new Matrix3(IDENTITY$1));
      return constants$1.IDENTITY;
    }

    static get ZERO() {
      constants$1.ZERO = constants$1.ZERO || Object.freeze(new Matrix3(ZERO$1));
      return constants$1.ZERO;
    }

    get ELEMENTS() {
      return 9;
    }

    get RANK() {
      return 3;
    }

    get INDICES() {
      return INDICES$1;
    }

    constructor(array) {
      // PERF NOTE: initialize elements as double precision numbers
      super(-0, -0, -0, -0, -0, -0, -0, -0, -0);

      if (arguments.length === 1 && Array.isArray(array)) {
        this.copy(array);
      } else {
        this.identity();
      }
    }

    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      this[4] = array[4];
      this[5] = array[5];
      this[6] = array[6];
      this[7] = array[7];
      this[8] = array[8];
      return this.check();
    } // accepts column major order, stores in column major order
    // eslint-disable-next-line max-params


    set(m00, m10, m20, m01, m11, m21, m02, m12, m22) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m01;
      this[4] = m11;
      this[5] = m21;
      this[6] = m02;
      this[7] = m12;
      this[8] = m22;
      return this.check();
    } // accepts row major order, stores as column major
    // eslint-disable-next-line max-params


    setRowMajor(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m01;
      this[4] = m11;
      this[5] = m21;
      this[6] = m02;
      this[7] = m12;
      this[8] = m22;
      return this.check();
    } // Accessors


    determinant() {
      return mat3.determinant(this);
    } // Constructors


    identity() {
      return this.copy(IDENTITY$1);
    } // Calculates a 3x3 matrix from the given quaternion
    // q quat  Quaternion to create matrix from


    fromQuaternion(q) {
      mat3.fromQuat(this, q);
      return this.check();
    } // Modifiers


    transpose() {
      mat3.transpose(this, this);
      return this.check();
    }

    invert() {
      mat3.invert(this, this);
      return this.check();
    } // Operations


    multiplyLeft(a) {
      mat3.multiply(this, a, this);
      return this.check();
    }

    multiplyRight(a) {
      mat3.multiply(this, this, a);
      return this.check();
    }

    rotate(radians) {
      mat3.rotate(this, this, radians);
      return this.check();
    }

    scale(factor) {
      if (Array.isArray(factor)) {
        mat3.scale(this, this, factor);
      } else {
        mat3.scale(this, this, [factor, factor, factor]);
      }

      return this.check();
    }

    translate(vec) {
      mat3.translate(this, this, vec);
      return this.check();
    } // Transforms


    transform(vector, result) {
      switch (vector.length) {
        case 2:
          result = vec2.transformMat3(result || [-0, -0], vector, this);
          break;

        case 3:
          result = vec3.transformMat3(result || [-0, -0, -0], vector, this);
          break;

        case 4:
          result = vec4_transformMat3(result || [-0, -0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector(result, vector.length);
      return result;
    } // DEPRECATED IN 3.0


    transformVector(vector, result) {
      deprecated('Matrix3.transformVector');
      return this.transform(vector, result);
    }

    transformVector2(vector, result) {
      deprecated('Matrix3.transformVector');
      return this.transform(vector, result);
    }

    transformVector3(vector, result) {
      deprecated('Matrix3.transformVector');
      return this.transform(vector, result);
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  const IDENTITY = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  const ZERO = Object.freeze([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const INDICES = Object.freeze({
    COL0ROW0: 0,
    COL0ROW1: 1,
    COL0ROW2: 2,
    COL0ROW3: 3,
    COL1ROW0: 4,
    COL1ROW1: 5,
    COL1ROW2: 6,
    COL1ROW3: 7,
    COL2ROW0: 8,
    COL2ROW1: 9,
    COL2ROW2: 10,
    COL2ROW3: 11,
    COL3ROW0: 12,
    COL3ROW1: 13,
    COL3ROW2: 14,
    COL3ROW3: 15
  });
  const constants = {};
  class Matrix4 extends Matrix {
    static get IDENTITY() {
      constants.IDENTITY = constants.IDENTITY || Object.freeze(new Matrix4(IDENTITY));
      return constants.IDENTITY;
    }

    static get ZERO() {
      constants.ZERO = constants.ZERO || Object.freeze(new Matrix4(ZERO));
      return constants.ZERO;
    }

    get INDICES() {
      return INDICES;
    }

    get ELEMENTS() {
      return 16;
    }

    get RANK() {
      return 4;
    }

    constructor(array) {
      // PERF NOTE: initialize elements as double precision numbers
      super(-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0);

      if (arguments.length === 1 && Array.isArray(array)) {
        this.copy(array);
      } else {
        this.identity();
      }
    }

    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      this[4] = array[4];
      this[5] = array[5];
      this[6] = array[6];
      this[7] = array[7];
      this[8] = array[8];
      this[9] = array[9];
      this[10] = array[10];
      this[11] = array[11];
      this[12] = array[12];
      this[13] = array[13];
      this[14] = array[14];
      this[15] = array[15];
      return this.check();
    } // eslint-disable-next-line max-params


    set(m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    } // accepts row major order, stores as column major
    // eslint-disable-next-line max-params


    setRowMajor(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
      this[0] = m00;
      this[1] = m10;
      this[2] = m20;
      this[3] = m30;
      this[4] = m01;
      this[5] = m11;
      this[6] = m21;
      this[7] = m31;
      this[8] = m02;
      this[9] = m12;
      this[10] = m22;
      this[11] = m32;
      this[12] = m03;
      this[13] = m13;
      this[14] = m23;
      this[15] = m33;
      return this.check();
    }

    toRowMajor(result) {
      result[0] = this[0];
      result[1] = this[4];
      result[2] = this[8];
      result[3] = this[12];
      result[4] = this[1];
      result[5] = this[5];
      result[6] = this[9];
      result[7] = this[13];
      result[8] = this[2];
      result[9] = this[6];
      result[10] = this[10];
      result[11] = this[14];
      result[12] = this[3];
      result[13] = this[7];
      result[14] = this[11];
      result[15] = this[15];
      return result;
    } // Constructors


    identity() {
      return this.copy(IDENTITY);
    } // Calculates a 4x4 matrix from the given quaternion
    // q quat  Quaternion to create matrix from


    fromQuaternion(q) {
      mat4.fromQuat(this, q);
      return this.check();
    } // Generates a frustum matrix with the given bounds
    // left  Number  Left bound of the frustum
    // right Number  Right bound of the frustum
    // bottom  Number  Bottom bound of the frustum
    // top Number  Top bound of the frustum
    // near  Number  Near bound of the frustum
    // far Number  Far bound of the frustum


    frustum({
      left,
      right,
      bottom,
      top,
      near,
      far
    }) {
      if (far === Infinity) {
        Matrix4._computeInfinitePerspectiveOffCenter(this, left, right, bottom, top, near);
      } else {
        mat4.frustum(this, left, right, bottom, top, near, far);
      }

      return this.check();
    } // eslint-disable-next-line max-params


    static _computeInfinitePerspectiveOffCenter(result, left, right, bottom, top, near) {
      const column0Row0 = 2.0 * near / (right - left);
      const column1Row1 = 2.0 * near / (top - bottom);
      const column2Row0 = (right + left) / (right - left);
      const column2Row1 = (top + bottom) / (top - bottom);
      const column2Row2 = -1.0;
      const column2Row3 = -1.0;
      const column3Row2 = -2.0 * near;
      result[0] = column0Row0;
      result[1] = 0.0;
      result[2] = 0.0;
      result[3] = 0.0;
      result[4] = 0.0;
      result[5] = column1Row1;
      result[6] = 0.0;
      result[7] = 0.0;
      result[8] = column2Row0;
      result[9] = column2Row1;
      result[10] = column2Row2;
      result[11] = column2Row3;
      result[12] = 0.0;
      result[13] = 0.0;
      result[14] = column3Row2;
      result[15] = 0.0;
      return result;
    } // Generates a look-at matrix with the given eye position, focal point,
    // and up axis
    // eye vec3  Position of the viewer
    // center  vec3  Point the viewer is looking at
    // up  vec3  vec3 pointing up


    lookAt(eye, center, up) {
      // Signature: lookAt({eye, center = [0, 0, 0], up = [0, 1, 0]}))
      if (arguments.length === 1) {
        ({
          eye,
          center,
          up
        } = eye);
      }

      center = center || [0, 0, 0];
      up = up || [0, 1, 0];
      mat4.lookAt(this, eye, center, up);
      return this.check();
    } // Generates a orthogonal projection matrix with the given bounds
    // from "traditional" view space parameters
    // left  number  Left bound of the frustum
    // right number  Right bound of the frustum
    // bottom  number  Bottom bound of the frustum
    // top number  Top bound of the frustum
    // near  number  Near bound of the frustum
    // far number  Far bound of the frustum


    ortho({
      left,
      right,
      bottom,
      top,
      near = 0.1,
      far = 500
    }) {
      mat4.ortho(this, left, right, bottom, top, near, far);
      return this.check();
    } // Generates an orthogonal projection matrix with the same parameters
    // as a perspective matrix (plus focalDistance)
    // fovy  number  Vertical field of view in radians
    // aspect  number  Aspect ratio. typically viewport width/height
    // focalDistance distance in the view frustum used for extent calculations
    // near  number  Near bound of the frustum
    // far number  Far bound of the frustum


    orthographic({
      fovy = 45 * Math.PI / 180,
      aspect = 1,
      focalDistance = 1,
      near = 0.1,
      far = 500
    }) {
      if (fovy > Math.PI * 2) {
        throw Error('radians');
      }

      const halfY = fovy / 2;
      const top = focalDistance * Math.tan(halfY); // focus_plane is the distance from the camera

      const right = top * aspect;
      return new Matrix4().ortho({
        left: -right,
        right,
        bottom: -top,
        top,
        near,
        far
      });
    } // Generates a perspective projection matrix with the given bounds
    // fovy  number  Vertical field of view in radians
    // aspect  number  Aspect ratio. typically viewport width/height
    // near  number  Near bound of the frustum
    // far number  Far bound of the frustum


    perspective({
      fovy = undefined,
      fov = 45 * Math.PI / 180,
      // DEPRECATED
      aspect = 1,
      near = 0.1,
      far = 500
    } = {}) {
      fovy = fovy || fov;

      if (fovy > Math.PI * 2) {
        throw Error('radians');
      }

      mat4.perspective(this, fovy, aspect, near, far);
      return this.check();
    } // Accessors


    determinant() {
      return mat4.determinant(this);
    } // Extracts the non-uniform scale assuming the matrix is an affine transformation.
    // The scales are the "lengths" of the column vectors in the upper-left 3x3 matrix.


    getScale(result = [-0, -0, -0]) {
      // explicit is faster than hypot...
      result[0] = Math.sqrt(this[0] * this[0] + this[1] * this[1] + this[2] * this[2]);
      result[1] = Math.sqrt(this[4] * this[4] + this[5] * this[5] + this[6] * this[6]);
      result[2] = Math.sqrt(this[8] * this[8] + this[9] * this[9] + this[10] * this[10]); // result[0] = Math.hypot(this[0], this[1], this[2]);
      // result[1] = Math.hypot(this[4], this[5], this[6]);
      // result[2] = Math.hypot(this[8], this[9], this[10]);

      return result;
    } // Gets the translation portion, assuming the matrix is a affine transformation matrix.


    getTranslation(result = [-0, -0, -0]) {
      result[0] = this[12];
      result[1] = this[13];
      result[2] = this[14];
      return result;
    } // Gets upper left 3x3 pure rotation matrix (non-scaling), assume affine transformation matrix


    getRotation(result = [-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0], scaleResult = null) {
      const scale = this.getScale(scaleResult || [-0, -0, -0]);
      const inverseScale0 = 1 / scale[0];
      const inverseScale1 = 1 / scale[1];
      const inverseScale2 = 1 / scale[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = 0;
      result[4] = this[4] * inverseScale0;
      result[5] = this[5] * inverseScale1;
      result[6] = this[6] * inverseScale2;
      result[7] = 0;
      result[8] = this[8] * inverseScale0;
      result[9] = this[9] * inverseScale1;
      result[10] = this[10] * inverseScale2;
      result[11] = 0;
      result[12] = 0;
      result[13] = 0;
      result[14] = 0;
      result[15] = 1;
      return result;
    }

    getRotationMatrix3(result = [-0, -0, -0, -0, -0, -0, -0, -0, -0], scaleResult = null) {
      const scale = this.getScale(scaleResult || [-0, -0, -0]);
      const inverseScale0 = 1 / scale[0];
      const inverseScale1 = 1 / scale[1];
      const inverseScale2 = 1 / scale[2];
      result[0] = this[0] * inverseScale0;
      result[1] = this[1] * inverseScale1;
      result[2] = this[2] * inverseScale2;
      result[3] = this[4] * inverseScale0;
      result[4] = this[5] * inverseScale1;
      result[5] = this[6] * inverseScale2;
      result[6] = this[8] * inverseScale0;
      result[7] = this[9] * inverseScale1;
      result[8] = this[10] * inverseScale2;
      return result;
    } // Modifiers


    transpose() {
      mat4.transpose(this, this);
      return this.check();
    }

    invert() {
      mat4.invert(this, this);
      return this.check();
    } // Operations


    multiplyLeft(a) {
      mat4.multiply(this, a, this);
      return this.check();
    }

    multiplyRight(a) {
      mat4.multiply(this, this, a);
      return this.check();
    } // Rotates a matrix by the given angle around the X axis


    rotateX(radians) {
      mat4.rotateX(this, this, radians); // mat4.rotate(this, this, radians, [1, 0, 0]);

      return this.check();
    } // Rotates a matrix by the given angle around the Y axis.


    rotateY(radians) {
      mat4.rotateY(this, this, radians); // mat4.rotate(this, this, radians, [0, 1, 0]);

      return this.check();
    } // Rotates a matrix by the given angle around the Z axis.


    rotateZ(radians) {
      mat4.rotateZ(this, this, radians); // mat4.rotate(this, this, radians, [0, 0, 1]);

      return this.check();
    }

    rotateXYZ([rx, ry, rz]) {
      return this.rotateX(rx).rotateY(ry).rotateZ(rz);
    }

    rotateAxis(radians, axis) {
      mat4.rotate(this, this, radians, axis);
      return this.check();
    }

    scale(factor) {
      if (Array.isArray(factor)) {
        mat4.scale(this, this, factor);
      } else {
        mat4.scale(this, this, [factor, factor, factor]);
      }

      return this.check();
    }

    translate(vec) {
      mat4.translate(this, this, vec);
      return this.check();
    } // Transforms
    // Transforms any 2, 3 or 4 element vector. 2 and 3 elements are treated as points


    transform(vector, result) {
      if (vector.length === 4) {
        result = vec4.transformMat4(result || [-0, -0, -0, -0], vector, this);
        checkVector(result, 4);
        return result;
      }

      return this.transformAsPoint(vector, result);
    } // Transforms any 2 or 3 element array as point (w implicitly 1)


    transformAsPoint(vector, result) {
      const {
        length
      } = vector;

      switch (length) {
        case 2:
          result = vec2.transformMat4(result || [-0, -0], vector, this);
          break;

        case 3:
          result = vec3.transformMat4(result || [-0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector(result, vector.length);
      return result;
    } // Transforms any 2 or 3 element array as vector (w implicitly 0)


    transformAsVector(vector, result) {
      switch (vector.length) {
        case 2:
          result = vec2_transformMat4AsVector(result || [-0, -0], vector, this);
          break;

        case 3:
          result = vec3_transformMat4AsVector(result || [-0, -0, -0], vector, this);
          break;

        default:
          throw new Error('Illegal vector');
      }

      checkVector(result, vector.length);
      return result;
    } // three.js math API compatibility


    makeRotationX(radians) {
      return this.identity().rotateX(radians);
    }

    makeTranslation(x, y, z) {
      return this.identity().translate([x, y, z]);
    } // DEPRECATED in 3.0


    transformPoint(vector, result) {
      deprecated('Matrix4.transformPoint', '3.0');
      return this.transformAsPoint(vector, result);
    }

    transformVector(vector, result) {
      deprecated('Matrix4.transformVector', '3.0');
      return this.transformAsPoint(vector, result);
    }

    transformDirection(vector, result) {
      deprecated('Matrix4.transformDirection', '3.0');
      return this.transformAsVector(vector, result);
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  const IDENTITY_QUATERNION = [0, 0, 0, 1];
  class Quaternion extends MathArray {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      // PERF NOTE: initialize elements as double precision numbers
      super(-0, -0, -0, -0); // eslint-disable-next-line prefer-rest-params

      if (Array.isArray(x) && arguments.length === 1) {
        this.copy(x);
      } else {
        this.set(x, y, z, w);
      }
    }

    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = array[3];
      return this.check();
    }

    set(x, y, z, w) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = w;
      return this.check();
    } // Creates a quaternion from the given 3x3 rotation matrix.
    // NOTE: The resultant quaternion is not normalized, so you should
    // be sure to renormalize the quaternion yourself where necessary.


    fromMatrix3(m) {
      quat.fromMat3(this, m);
      return this.check();
    } // Set a quat to the identity quaternion


    identity() {
      quat.identity(this);
      return this.check();
    }

    fromAxisRotation(axis, rad) {
      quat.setAxisAngle(this, axis, rad);
      return this.check();
    } // Set the components of a quat to the given values
    // set(i, j, k, l) {
    //   quat.set(this, i, j, k, l);
    //   return this.check();
    // }
    // Sets a quat from the given angle and rotation axis, then returns it.


    setAxisAngle(axis, rad) {
      return this.fromAxisRotation(axis, rad);
    } // Getters/setters

    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */


    get ELEMENTS() {
      return 4;
    }

    get x() {
      return this[0];
    }

    set x(value) {
      this[0] = checkNumber(value);
    }

    get y() {
      return this[1];
    }

    set y(value) {
      this[1] = checkNumber(value);
    }

    get z() {
      return this[2];
    }

    set z(value) {
      this[2] = checkNumber(value);
    }

    get w() {
      return this[3];
    }

    set w(value) {
      this[3] = checkNumber(value);
    }
    /* eslint-enable no-multi-spaces, brace-style, no-return-assign */
    // Calculates the length of a quat


    len() {
      return quat.length(this);
    } // Calculates the squared length of a quat


    lengthSquared() {
      return quat.squaredLength(this);
    } // Calculates the dot product of two quat's
    // @return {Number}


    dot(a, b) {
      if (b !== undefined) {
        throw new Error('Quaternion.dot only takes one argument');
      }

      return quat.dot(this, a);
    } // Gets the rotation axis and angle for a given quaternion.
    // If a quaternion is created with setAxisAngle, this method will
    // return the same values as providied in the original parameter
    // list OR functionally equivalent values.
    // Example: The quaternion formed by axis [0, 0, 1] and angle -90
    // is the same as the quaternion formed by [0, 0, 1] and 270.
    // This method favors the latter.
    // @return {{[x,y,z], Number}}
    // getAxisAngle() {
    //   const axis = [];
    //   const angle = quat.getAxisAngle(axis, this);
    //   return {axis, angle};
    // }
    // MODIFIERS
    // Sets a quaternion to represent the shortest rotation from one vector
    // to another. Both vectors are assumed to be unit length.


    rotationTo(vectorA, vectorB) {
      quat.rotationTo(this, vectorA, vectorB);
      return this.check();
    } // Sets the specified quaternion with values corresponding to the given axes.
    // Each axis is a vec3 and is expected to be unit length and perpendicular
    // to all other specified axes.
    // setAxes() {
    //   Number
    // }
    // Performs a spherical linear interpolation with two control points
    // sqlerp() {
    //   Number;
    // }
    // Adds two quat's


    add(a, b) {
      if (b !== undefined) {
        throw new Error('Quaternion.add only takes one argument');
      }

      quat.add(this, this, a);
      return this.check();
    } // Calculates the W component of a quat from the X, Y, and Z components.
    // Any existing W component will be ignored.


    calculateW() {
      quat.calculateW(this, this);
      return this.check();
    } // Calculates the conjugate of a quat If the quaternion is normalized,
    // this function is faster than quat.inverse and produces the same result.


    conjugate() {
      quat.conjugate(this, this);
      return this.check();
    } // Calculates the inverse of a quat


    invert() {
      quat.invert(this, this);
      return this.check();
    } // Performs a linear interpolation between two quat's


    lerp(a, b, t) {
      quat.lerp(this, a, b, t);
      return this.check();
    } // Multiplies two quat's


    multiplyRight(a, b) {
      assert(!b); // Quaternion.multiply only takes one argument

      quat.multiply(this, this, a);
      return this.check();
    }

    multiplyLeft(a, b) {
      assert(!b); // Quaternion.multiply only takes one argument

      quat.multiply(this, a, this);
      return this.check();
    } // Normalize a quat


    normalize() {
      // Handle 0 case
      const length = this.len();
      const l = length > 0 ? 1 / length : 0;
      this[0] = this[0] * l;
      this[1] = this[1] * l;
      this[2] = this[2] * l;
      this[3] = this[3] * l; // Set to [0, 0, 0, 1] if length is 0

      if (length === 0) {
        this[3] = 1;
      }

      return this.check();
    } // Rotates a quaternion by the given angle about the X axis


    rotateX(rad) {
      quat.rotateX(this, this, rad);
      return this.check();
    } // Rotates a quaternion by the given angle about the Y axis


    rotateY(rad) {
      quat.rotateY(this, this, rad);
      return this.check();
    } // Rotates a quaternion by the given angle about the Z axis


    rotateZ(rad) {
      quat.rotateZ(this, this, rad);
      return this.check();
    } // Scales a quat by a scalar number


    scale(b) {
      quat.scale(this, this, b);
      return this.check();
    } // Performs a spherical linear interpolation between two quat


    slerp(start, target, ratio) {
      // eslint-disable-next-line prefer-rest-params
      switch (arguments.length) {
        case 1:
          // Deprecated signature ({start, target, ratio})
          // eslint-disable-next-line prefer-rest-params
          ({
            start = IDENTITY_QUATERNION,
            target,
            ratio
          } = arguments[0]);
          break;

        case 2:
          // THREE.js compatibility signature (target, ration)
          // eslint-disable-next-line prefer-rest-params
          [target, ratio] = arguments;
          start = this; // eslint-disable-line

          break;

      }

      quat.slerp(this, start, target, ratio);
      return this.check();
    }

    transformVector4(vector, result = vector) {
      vec4.transformQuat(result, vector, this);
      return checkVector(result, 4);
    } // THREE.js Math API compatibility


    lengthSq() {
      return this.lengthSquared();
    }

    setFromAxisAngle(axis, rad) {
      return this.setAxisAngle(axis, rad);
    }

    premultiply(a, b) {
      return this.multiplyLeft(a, b);
    }

    multiply(a, b) {
      return this.multiplyRight(a, b);
    }

  }

  // NOTE: Added to make Cesium-derived test cases work
  // TODO: Determine if/how to keep
  var mathUtils = {
    EPSILON1: 1e-1,
    EPSILON2: 1e-2,
    EPSILON3: 1e-3,
    EPSILON4: 1e-4,
    EPSILON5: 1e-5,
    EPSILON6: 1e-6,
    EPSILON7: 1e-7,
    EPSILON8: 1e-8,
    EPSILON9: 1e-9,
    EPSILON10: 1e-10,
    EPSILON11: 1e-11,
    EPSILON12: 1e-12,
    EPSILON13: 1e-13,
    EPSILON14: 1e-14,
    EPSILON15: 1e-15,
    EPSILON16: 1e-16,
    EPSILON17: 1e-17,
    EPSILON18: 1e-18,
    EPSILON19: 1e-19,
    EPSILON20: 1e-20,
    PI_OVER_TWO: Math.PI / 2,
    PI_OVER_FOUR: Math.PI / 4,
    PI_OVER_SIX: Math.PI / 6,
    TWO_PI: Math.PI * 2
  };

  // Copyright (c) 2017 Uber Technologies, Inc.

  const EPSILON = 0.000001;
  const EARTH_RADIUS_METERS = 6.371e6; // Todo [rho, theta, phi] ?

  class SphericalCoordinates {
    // @ts-ignore TS2740: Type '{}' is missing the following properties from type
    // eslint-disable-next-line complexity
    constructor({
      phi = 0,
      theta = 0,
      radius = 1,
      bearing = undefined,
      pitch = undefined,
      altitude = undefined,
      radiusScale = EARTH_RADIUS_METERS
    } = {}) {
      this.phi = phi;
      this.theta = theta; // TODO - silently accepts illegal 0

      this.radius = radius || altitude || 1; // radial distance from center

      this.radiusScale = radiusScale || 1; // Used by lngLatZ

      if (bearing !== undefined) {
        this.bearing = bearing; // up / down towards top and bottom pole
      }

      if (pitch !== undefined) {
        this.pitch = pitch; // around the equator of the sphere
      }

      this.check();
    }

    toString() {
      return this.formatString(config);
    }

    formatString({
      printTypes = false
    }) {
      const f = formatValue;
      return `${printTypes ? 'Spherical' : ''}\
[rho:${f(this.radius)},theta:${f(this.theta)},phi:${f(this.phi)}]`;
    }

    equals(other) {
      return equals(this.radius, other.radius) && equals(this.theta, other.theta) && equals(this.phi, other.phi);
    }

    exactEquals(other) {
      return this.radius === other.radius && this.theta === other.theta && this.phi === other.phi;
    }
    /* eslint-disable brace-style */
    // Cartographic (bearing 0 north, pitch 0 look from above)


    get bearing() {
      return 180 - degrees(this.phi);
    }

    set bearing(v) {
      this.phi = Math.PI - radians(v);
    }

    get pitch() {
      return degrees(this.theta);
    }

    set pitch(v) {
      this.theta = radians(v);
    } // get pitch() { return 90 - degrees(this.phi); }
    // set pitch(v) { this.phi = radians(v) + Math.PI / 2; }
    // get altitude() { return this.radius - 1; } // relative altitude
    // lnglatZ coordinates


    get longitude() {
      return degrees(this.phi);
    }

    get latitude() {
      return degrees(this.theta);
    }

    get lng() {
      return degrees(this.phi);
    }

    get lat() {
      return degrees(this.theta);
    }

    get z() {
      return (this.radius - 1) * this.radiusScale;
    }
    /* eslint-enable brace-style */


    set(radius, phi, theta) {
      this.radius = radius;
      this.phi = phi;
      this.theta = theta;
      return this.check();
    }

    clone() {
      return new SphericalCoordinates().copy(this);
    }

    copy(other) {
      this.radius = other.radius;
      this.phi = other.phi;
      this.theta = other.theta;
      return this.check();
    }

    fromLngLatZ([lng, lat, z]) {
      this.radius = 1 + z / this.radiusScale;
      this.phi = radians(lat);
      this.theta = radians(lng);
    }

    fromVector3(v) {
      this.radius = vec3.length(v);

      if (this.radius > 0) {
        this.theta = Math.atan2(v[0], v[1]); // equator angle around y-up axis

        this.phi = Math.acos(clamp(v[2] / this.radius, -1, 1)); // polar angle
      }

      return this.check();
    }

    toVector3() {
      return new Vector3(0, 0, this.radius).rotateX({
        radians: this.theta
      }).rotateZ({
        radians: this.phi
      });
    } // restrict phi to be betwee EPS and PI-EPS


    makeSafe() {
      this.phi = Math.max(EPSILON, Math.min(Math.PI - EPSILON, this.phi));
      return this;
    }

    check() {
      // this.makeSafe();
      if (!Number.isFinite(this.phi) || !Number.isFinite(this.theta) || !(this.radius > 0)) {
        throw new Error('SphericalCoordinates: some fields set to invalid numbers');
      }

      return this;
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.

  const ERR_UNKNOWN_ORDER = 'Unknown Euler angle order';
  const ALMOST_ONE = 0.99999;

  function validateOrder(value) {
    return value >= 0 && value < 6;
  }

  function checkOrder(value) {
    if (value < 0 && value >= 6) {
      throw new Error(ERR_UNKNOWN_ORDER);
    }

    return value;
  }

  class Euler extends MathArray {
    // static XYZ = 0;
    // static YZX = 1;
    // static ZXY = 2;
    // static XZY = 3;
    // static YXZ = 4;
    // static ZYX = 5;
    // static RollPitchYaw = 0;
    // static DefaultOrder = 0;
    // Constants

    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */
    static get ZYX() {
      return 0;
    }

    static get YXZ() {
      return 1;
    }

    static get XZY() {
      return 2;
    }

    static get ZXY() {
      return 3;
    }

    static get YZX() {
      return 4;
    }

    static get XYZ() {
      return 5;
    }

    static get RollPitchYaw() {
      return 0;
    }

    static get DefaultOrder() {
      return Euler.ZYX;
    }

    static get RotationOrders() {
      return ['ZYX', 'YXZ', 'XZY', 'ZXY', 'YZX', 'XYZ'];
    }

    static rotationOrder(order) {
      return Euler.RotationOrders[order];
    }

    get ELEMENTS() {
      return 4;
    }
    /* eslint-enable no-multi-spaces, brace-style, no-return-assign */

    /**
     * @class
     * @param {Number | Number[]} x
     * @param {Number=} [y]
     * @param {Number=} [z]
     * @param {Number=} [order]
     */


    constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
      // PERF NOTE: initialize elements as double precision numbers
      super(-0, -0, -0, -0); // eslint-disable-next-line prefer-rest-params

      if (arguments.length > 0 && Array.isArray(arguments[0])) {
        // eslint-disable-next-line prefer-rest-params
        this.fromVector3(...arguments);
      } else {
        // @ts-ignore error TS2345: Argument of type 'number | [number, number, number, number]' not assignable to 'number'
        this.set(x, y, z, order);
      }
    }

    fromQuaternion(quaternion) {
      const [x, y, z, w] = quaternion;
      const ysqr = y * y;
      const t0 = -2.0 * (ysqr + z * z) + 1.0;
      const t1 = +2.0 * (x * y + w * z);
      let t2 = -2.0 * (x * z - w * y);
      const t3 = +2.0 * (y * z + w * x);
      const t4 = -2.0 * (x * x + ysqr) + 1.0;
      t2 = t2 > 1.0 ? 1.0 : t2;
      t2 = t2 < -1.0 ? -1.0 : t2;
      const roll = Math.atan2(t3, t4);
      const pitch = Math.asin(t2);
      const yaw = Math.atan2(t1, t0);
      return new Euler(roll, pitch, yaw, Euler.RollPitchYaw);
    } // fromQuaternion(q, order) {
    //   this._fromRotationMat[-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0];
    //   return this.check();
    // }
    // If copied array does contain fourth element, preserves currently set order


    copy(array) {
      this[0] = array[0];
      this[1] = array[1];
      this[2] = array[2];
      this[3] = Number.isFinite(array[3]) || this.order;
      return this.check();
    } // Sets the three angles, and optionally sets the rotation order
    // If order is not specified, preserves currently set order


    set(x = 0, y = 0, z = 0, order) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      this[3] = Number.isFinite(order) ? order : this[3];
      return this.check();
    }

    validate() {
      return validateOrder(this[3]) && Number.isFinite(this[0]) && Number.isFinite(this[1]) && Number.isFinite(this[2]);
    } // Does not copy the orientation element


    toArray(array = [], offset = 0) {
      array[offset] = this[0];
      array[offset + 1] = this[1];
      array[offset + 2] = this[2];
      return array;
    } // Copies the orientation element


    toArray4(array = [], offset = 0) {
      array[offset] = this[0];
      array[offset + 1] = this[1];
      array[offset + 2] = this[2];
      array[offset + 3] = this[3];
      return array;
    }

    toVector3(result = [-0, -0, -0]) {
      result[0] = this[0];
      result[1] = this[1];
      result[2] = this[2];
      return result;
    }
    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */
    // x, y, z angle notation (note: only corresponds to axis in XYZ orientation)

    /** @type {number} */


    get x() {
      return this[0];
    }

    set x(value) {
      this[0] = checkNumber(value);
    }
    /** @type {number} */


    get y() {
      return this[1];
    }

    set y(value) {
      this[1] = checkNumber(value);
    }
    /** @type {number} */


    get z() {
      return this[2];
    }

    set z(value) {
      this[2] = checkNumber(value);
    } // alpha, beta, gamma angle notation


    get alpha() {
      return this[0];
    }

    set alpha(value) {
      this[0] = checkNumber(value);
    }

    get beta() {
      return this[1];
    }

    set beta(value) {
      this[1] = checkNumber(value);
    }

    get gamma() {
      return this[2];
    }

    set gamma(value) {
      this[2] = checkNumber(value);
    } // phi, theta, psi angle notation


    get phi() {
      return this[0];
    }

    set phi(value) {
      this[0] = checkNumber(value);
    }

    get theta() {
      return this[1];
    }

    set theta(value) {
      this[1] = checkNumber(value);
    }

    get psi() {
      return this[2];
    }

    set psi(value) {
      this[2] = checkNumber(value);
    } // roll, pitch, yaw angle notation

    /** @type {number} */


    get roll() {
      return this[0];
    }

    set roll(value) {
      this[0] = checkNumber(value);
    }
    /** @type {number} */


    get pitch() {
      return this[1];
    }

    set pitch(value) {
      this[1] = checkNumber(value);
    }
    /** @type {number} */


    get yaw() {
      return this[2];
    }

    set yaw(value) {
      this[2] = checkNumber(value);
    } // rotation order, in all three angle notations


    get order() {
      return this[3];
    }

    set order(value) {
      this[3] = checkOrder(value);
    }
    /* eslint-disable no-multi-spaces, brace-style, no-return-assign */
    // Constructors


    fromVector3(v, order) {
      return this.set(v[0], v[1], v[2], Number.isFinite(order) ? order : this[3]);
    } // TODO - with and without 4th element


    fromArray(array, offset = 0) {
      this[0] = array[0 + offset];
      this[1] = array[1 + offset];
      this[2] = array[2 + offset];

      if (array[3] !== undefined) {
        this[3] = array[3];
      }

      return this.check();
    } // Common ZYX rotation order


    fromRollPitchYaw(roll, pitch, yaw) {
      return this.set(roll, pitch, yaw, Euler.ZYX);
    }

    fromRotationMatrix(m, order = Euler.DefaultOrder) {
      this._fromRotationMatrix(m, order);

      return this.check();
    } // ACCESSORS


    getRotationMatrix(m) {
      return this._getRotationMatrix(m);
    } // TODO - move to Quaternion


    getQuaternion() {
      const q = new Quaternion();

      switch (this[4]) {
        case Euler.XYZ:
          return q.rotateX(this[0]).rotateY(this[1]).rotateZ(this[2]);

        case Euler.YXZ:
          return q.rotateY(this[0]).rotateX(this[1]).rotateZ(this[2]);

        case Euler.ZXY:
          return q.rotateZ(this[0]).rotateX(this[1]).rotateY(this[2]);

        case Euler.ZYX:
          return q.rotateZ(this[0]).rotateY(this[1]).rotateX(this[2]);

        case Euler.YZX:
          return q.rotateY(this[0]).rotateZ(this[1]).rotateX(this[2]);

        case Euler.XZY:
          return q.rotateX(this[0]).rotateZ(this[1]).rotateY(this[2]);

        default:
          throw new Error(ERR_UNKNOWN_ORDER);
      }
    } // INTERNAL METHODS
    // Concersion from Euler to rotation matrix and from matrix to Euler
    // Adapted from three.js under MIT license
    // // WARNING: this discards revolution information -bhouston
    // reorder(newOrder) {
    //   const q = new Quaternion().setFromEuler(this);
    //   return this.setFromQuaternion(q, newOrder);

    /* eslint-disable complexity, max-statements, one-var */


    _fromRotationMatrix(m, order = Euler.DefaultOrder) {
      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
      const te = m.elements;
      const m11 = te[0],
            m12 = te[4],
            m13 = te[8];
      const m21 = te[1],
            m22 = te[5],
            m23 = te[9];
      const m31 = te[2],
            m32 = te[6],
            m33 = te[10];
      order = order || this[3];

      switch (order) {
        case Euler.XYZ:
          this[1] = Math.asin(clamp(m13, -1, 1));

          if (Math.abs(m13) < ALMOST_ONE) {
            this[0] = Math.atan2(-m23, m33);
            this[2] = Math.atan2(-m12, m11);
          } else {
            this[0] = Math.atan2(m32, m22);
            this[2] = 0;
          }

          break;

        case Euler.YXZ:
          this[0] = Math.asin(-clamp(m23, -1, 1));

          if (Math.abs(m23) < ALMOST_ONE) {
            this[1] = Math.atan2(m13, m33);
            this[2] = Math.atan2(m21, m22);
          } else {
            this[1] = Math.atan2(-m31, m11);
            this[2] = 0;
          }

          break;

        case Euler.ZXY:
          this[0] = Math.asin(clamp(m32, -1, 1));

          if (Math.abs(m32) < ALMOST_ONE) {
            this[1] = Math.atan2(-m31, m33);
            this[2] = Math.atan2(-m12, m22);
          } else {
            this[1] = 0;
            this[2] = Math.atan2(m21, m11);
          }

          break;

        case Euler.ZYX:
          this[1] = Math.asin(-clamp(m31, -1, 1));

          if (Math.abs(m31) < ALMOST_ONE) {
            this[0] = Math.atan2(m32, m33);
            this[2] = Math.atan2(m21, m11);
          } else {
            this[0] = 0;
            this[2] = Math.atan2(-m12, m22);
          }

          break;

        case Euler.YZX:
          this[2] = Math.asin(clamp(m21, -1, 1));

          if (Math.abs(m21) < ALMOST_ONE) {
            this[0] = Math.atan2(-m23, m22);
            this[1] = Math.atan2(-m31, m11);
          } else {
            this[0] = 0;
            this[1] = Math.atan2(m13, m33);
          }

          break;

        case Euler.XZY:
          this[2] = Math.asin(-clamp(m12, -1, 1));

          if (Math.abs(m12) < ALMOST_ONE) {
            this[0] = Math.atan2(m32, m22);
            this[1] = Math.atan2(m13, m11);
          } else {
            this[0] = Math.atan2(-m23, m33);
            this[1] = 0;
          }

          break;

        default:
          throw new Error(ERR_UNKNOWN_ORDER);
      }

      this[3] = order;
      return this;
    }

    _getRotationMatrix(result) {
      const te = result || [-0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0, -0];
      const x = this.x,
            y = this.y,
            z = this.z;
      const a = Math.cos(x);
      const c = Math.cos(y);
      const e = Math.cos(z);
      const b = Math.sin(x);
      const d = Math.sin(y);
      const f = Math.sin(z);

      switch (this[3]) {
        case Euler.XYZ:
          {
            const ae = a * e,
                  af = a * f,
                  be = b * e,
                  bf = b * f;
            te[0] = c * e;
            te[4] = -c * f;
            te[8] = d;
            te[1] = af + be * d;
            te[5] = ae - bf * d;
            te[9] = -b * c;
            te[2] = bf - ae * d;
            te[6] = be + af * d;
            te[10] = a * c;
            break;
          }

        case Euler.YXZ:
          {
            const ce = c * e,
                  cf = c * f,
                  de = d * e,
                  df = d * f;
            te[0] = ce + df * b;
            te[4] = de * b - cf;
            te[8] = a * d;
            te[1] = a * f;
            te[5] = a * e;
            te[9] = -b;
            te[2] = cf * b - de;
            te[6] = df + ce * b;
            te[10] = a * c;
            break;
          }

        case Euler.ZXY:
          {
            const ce = c * e,
                  cf = c * f,
                  de = d * e,
                  df = d * f;
            te[0] = ce - df * b;
            te[4] = -a * f;
            te[8] = de + cf * b;
            te[1] = cf + de * b;
            te[5] = a * e;
            te[9] = df - ce * b;
            te[2] = -a * d;
            te[6] = b;
            te[10] = a * c;
            break;
          }

        case Euler.ZYX:
          {
            const ae = a * e,
                  af = a * f,
                  be = b * e,
                  bf = b * f;
            te[0] = c * e;
            te[4] = be * d - af;
            te[8] = ae * d + bf;
            te[1] = c * f;
            te[5] = bf * d + ae;
            te[9] = af * d - be;
            te[2] = -d;
            te[6] = b * c;
            te[10] = a * c;
            break;
          }

        case Euler.YZX:
          {
            const ac = a * c,
                  ad = a * d,
                  bc = b * c,
                  bd = b * d;
            te[0] = c * e;
            te[4] = bd - ac * f;
            te[8] = bc * f + ad;
            te[1] = f;
            te[5] = a * e;
            te[9] = -b * e;
            te[2] = -d * e;
            te[6] = ad * f + bc;
            te[10] = ac - bd * f;
            break;
          }

        case Euler.XZY:
          {
            const ac = a * c,
                  ad = a * d,
                  bc = b * c,
                  bd = b * d;
            te[0] = c * e;
            te[4] = -f;
            te[8] = d * e;
            te[1] = ac * f + bd;
            te[5] = a * e;
            te[9] = ad * f - bc;
            te[2] = bc * f - ad;
            te[6] = b * e;
            te[10] = bd * f + ac;
            break;
          }

        default:
          throw new Error(ERR_UNKNOWN_ORDER);
      } // last column


      te[3] = 0;
      te[7] = 0;
      te[11] = 0; // bottom row

      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;
      return te;
    }

    toQuaternion() {
      // Abbreviations for the various angular functions
      const cy = Math.cos(this.yaw * 0.5);
      const sy = Math.sin(this.yaw * 0.5);
      const cr = Math.cos(this.roll * 0.5);
      const sr = Math.sin(this.roll * 0.5);
      const cp = Math.cos(this.pitch * 0.5);
      const sp = Math.sin(this.pitch * 0.5);
      const w = cy * cr * cp + sy * sr * sp;
      const x = cy * sr * cp - sy * cr * sp;
      const y = cy * cr * sp + sy * sr * cp;
      const z = sy * cr * cp - cy * sr * sp;
      return new Quaternion(x, y, z, w);
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  class Pose {
    // @ts-ignore TS2740: Type '{}' is missing the following properties from type
    constructor({
      x = 0,
      y = 0,
      z = 0,
      roll = 0,
      pitch = 0,
      yaw = 0,
      position = undefined,
      orientation = undefined
    } = {}) {
      if (Array.isArray(position) && position.length === 3) {
        this.position = new Vector3(position);
      } else {
        this.position = new Vector3(x, y, z);
      }

      if (Array.isArray(orientation) && orientation.length === 4) {
        this.orientation = new Euler(orientation, orientation[3]);
      } else {
        this.orientation = new Euler(roll, pitch, yaw, Euler.RollPitchYaw);
      }
    }

    get x() {
      return this.position.x;
    }

    set x(value) {
      this.position.x = value;
    }

    get y() {
      return this.position.y;
    }

    set y(value) {
      this.position.y = value;
    }

    get z() {
      return this.position.z;
    }

    set z(value) {
      this.position.z = value;
    }

    get roll() {
      return this.orientation.roll;
    }

    set roll(value) {
      this.orientation.roll = value;
    }

    get pitch() {
      return this.orientation.pitch;
    }

    set pitch(value) {
      this.orientation.pitch = value;
    }

    get yaw() {
      return this.orientation.yaw;
    }

    set yaw(value) {
      this.orientation.yaw = value;
    }

    getPosition() {
      return this.position;
    }

    getOrientation() {
      return this.orientation;
    }

    equals(pose) {
      if (!pose) {
        return false;
      }

      return this.position.equals(pose.position) && this.orientation.equals(pose.orientation);
    }

    exactEquals(pose) {
      if (!pose) {
        return false;
      }

      return this.position.exactEquals(pose.position) && this.orientation.exactEquals(pose.orientation);
    }

    getTransformationMatrix() {
      // setup precomputations for the sin/cos of the angles
      const sr = Math.sin(this.roll);
      const sp = Math.sin(this.pitch);
      const sw = Math.sin(this.yaw);
      const cr = Math.cos(this.roll);
      const cp = Math.cos(this.pitch);
      const cw = Math.cos(this.yaw);
      const matrix = new Matrix4().setRowMajor(cw * cp, // 0,0
      -sw * cr + cw * sp * sr, // 0,1
      sw * sr + cw * sp * cr, // 0,2
      this.x, // 0,3
      sw * cp, // 1,0
      cw * cr + sw * sp * sr, // 1,1
      -cw * sr + sw * sp * cr, // 1,2
      this.y, // 1,3
      -sp, // 2,0
      cp * sr, // 2,1
      cp * cr, // 2,2
      this.z, // 2,3
      0, 0, 0, 1);
      return matrix;
    }

    getTransformationMatrixFromPose(pose) {
      return new Matrix4().multiplyRight(this.getTransformationMatrix()).multiplyRight(pose.getTransformationMatrix().invert());
    }

    getTransformationMatrixToPose(pose) {
      return new Matrix4().multiplyRight(pose.getTransformationMatrix()).multiplyRight(this.getTransformationMatrix().invert());
    }

  }

  // Copyright (c) 2017 Uber Technologies, Inc.
  const globals = {
    // eslint-disable-next-line no-restricted-globals
    self: typeof self !== 'undefined' && self,
    window: typeof window !== 'undefined' && window,
    global: typeof global !== 'undefined' && global
  };
  const global_ = globals.global || globals.self || globals.window; // Make config avalable as global variable for access in debugger
  // TODO - integrate with probe.gl (as soft dependency) to persist across reloades
  // @ts-ignore error TS2339: Property 'mathgl' does not exist on type 'Window | Global

  // global_.mathgl = {
  //   config
  // }; // DEPRECATED

  exports.Euler = Euler;
  exports.Matrix3 = Matrix3;
  exports.Matrix4 = Matrix4;
  exports.Pose = Pose;
  exports.Quaternion = Quaternion;
  exports.SphericalCoordinates = SphericalCoordinates;
  exports.Vector2 = Vector2;
  exports.Vector3 = Vector3;
  exports.Vector4 = Vector4;
  exports._Euler = Euler;
  exports._MathUtils = mathUtils;
  exports._Pose = Pose;
  exports._SphericalCoordinates = SphericalCoordinates;
  exports.acos = acos;
  exports.asin = asin;
  exports.assert = assert;
  exports.atan = atan;
  exports.checkNumber = checkNumber;
  exports.clamp = clamp;
  exports.clone = clone;
  exports.config = config;
  exports.configure = configure;
  exports.cos = cos;
  exports.degrees = degrees;
  exports.equals = equals;
  exports.exactEquals = exactEquals;
  exports.formatValue = formatValue;
  exports.isArray = isArray;
  exports.lerp = lerp;
  exports.radians = radians;
  exports.sin = sin;
  exports.tan = tan;
  exports.toDegrees = toDegrees;
  exports.toRadians = toRadians;
  exports.withEpsilon = withEpsilon;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
