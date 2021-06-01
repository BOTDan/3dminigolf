/**
 * @class
 * @classdesc Used for simulating physics in a world. 
 */
class PhysicsWorld {
  /**
   * Creates a new physics world
   */
  constructor() {
    this.colliders = [];
    this.gravityDirection = new Vector(0, -1, 0);
    this.gravityStrength = 1;
    this.timescale = 1;
  }

  get colliders() { return this._colliders; }
  get gravityDirection() { return this._gravityDirection; }
  get gravityStrength() { return this._gravityStrength; }
  get timescale() { return this._timescale; }
  get ball() { return this._ball; }

  set colliders(value) { this._colliders = value; }
  set gravityDirection(value) { this._gravityDirection = value; }
  set gravityStrength(value) { this._gravityStrength = value; }
  set timescale(value) { this._timescale = value; }
  set ball(value) {
    this._ball = value;
    this.colliders.forEach((collider) => {
      collider.ball = value;
    })
  }
  
  /**
   * Adds a physics collider to the world
   * @param {Collider} collider The collider to add
   */
  addCollider(collider) {
    this.colliders.push(collider);
    collider.ball = this.ball;
  }

  think(dt) {
    let remainingDistance = this.ball.velocity.length() * dt * this.timescale;
  }

  findNextCollision() {
    const distance = this.ball.frameVelocity.length(); // FIX: Use lengthSqr

  }

  /**
   * Debug draw function
   * @param {SScene} scene The scene
   */
   debugDraw(scene) {
    this.colliders.forEach((collider) => {
      collider.debugDraw(scene);
    });
    this.ball.debugDraw(scene);
  }
}

/**
 * @class
 * @classdesc A ball used for physics simulation
 */
class PhysicsBall {
  /**
   * Creates a new ball
   * @param {Vector} pos The position of the ball 
   * @param {Number} size The size of the ball 
   */
  constructor(pos, size=0.1) {
    this.position = pos;
    this.velocity = new Vector(0, 0, 0);
    this.size = size;
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get velocity() { return this._velocity; }
  get size() { return this._size; }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set velocity(value) { this._velocity = value; }
  set size(value) { this._size = value; }

  /**
   * Debug draw function
   * @param {Scene} scene The scene, for rendering
   */
  debugDraw(scene) {
    _r.color(0, 1, 0, 1);
    scene.drawPoint(this.position, 10);
    _r.color(0.5, 1, 0, 1);
    scene.drawLine(this.position, this.position.add(this.velocity));
  }
}

/**
 * @class
 * @classdesc A collider representing part of a plane in 3D space
 */
class PlaneCollider {
  /**
   * Creates a plane for collision
   * @param {Vector} point1 The first point on the plane
   * @param {Vector} point2 The second point on the plane
   * @param {Vector} point3 The third point on the plane
   * @param {Vector} point4 The forth point on the plane
   */
  constructor(point1, point2, point3, point4, flipNormal=false) {
    this.points = [point1, point2, point3, point4];
    this.flipNormal = flipNormal;
    this._normal = util.findNormal(this.points);
    if (this.flipNormal) {
      this._normal = this.normal.invert();
    }
  }

  get points() { return this._points; }
  get flipNormal() { return this._flipNormal; }
  get normal() { return this._normal; }
  get offsetPoints() { return this._offsetPoints; }
  get ballSize() { return this._ballSize; }
  get ball() { return this._ball; }
  get collisionPoint() { return this._collisionPoint; }
  get collisionDistance() { return this._collisionDistance; }

  set points(value) { this._points = value; }
  set flipNormal(value) { this._flipNormal = value; }
  set ball(value) {
    this._ball = value;
    this.calcOffsetPoints();
  }

  /**
   * Pre-calculates offset points
   */
  calcOffsetPoints() {
    this._offsetPoints = this.points.map((point) => {
      return point.add(this.normal.multiply(this.ball.size));
    });
  }

  /**
   * Works out where the ball would cross the plane
   * @returns {point: Vector, distance: Number} Collision data
   */
  calcCollisionPoint() {
    const hitData = util.getLineIntersection(
      this.ball.position,
      this.ball.position.add(this.ball.velocity),
      this.offsetPoints[0],
      this.normal
    );
    this._collisionPoint = hitData.point || null;
    this._collisionDistance = hitData.distance || -Infinity;
    this.calcCollision();
    return hitData;
  }

  calcCollision() {
    if (!this.collisionPoint || this.collisionDistance < 0) {
      return null;
    }
    const reflection = this.ball.velocity.reflect(this.normal);
    const newLength = this.ball.velocity.length() - this.collisionDistance;
    this._collisionReflection = reflection.normalize().multiply(newLength);
  }

  /**
   * Debug draw function
   * @param {Scene} scene The scene, for rendering
   */
  debugDraw(scene) {
    // Draw the initial plane points
    _r.color(1, 0, 0, 0.5);
    for (let i=0; i < this.points.length - 1; i++) {
      scene.drawLine(this.points[i], this.points[i+1]);
    }
    if (this.points.length > 2) {
      scene.drawLine(this.points[0], this.points[this.points.length-1]);
    }
    // Draw the normal
    _r.color(1, 0, 0, 1);
    scene.drawLine(this.points[0], this.points[0].add(this.normal.multiply(this.ball.size / 2)));
    // Draw the adjusted plane points
    _r.color(1, 0, 0, 1);
    for (let i=0; i < this.offsetPoints.length - 1; i++) {
      scene.drawLine(this.offsetPoints[i], this.offsetPoints[i+1]);
    }
    if (this.offsetPoints.length > 2) {
      scene.drawLine(this.offsetPoints[0], this.offsetPoints[this.offsetPoints.length-1]);
    }
    // Draw collision point
    this.calcCollisionPoint();
    if (this.collisionPoint && this.collisionDistance >= 0) {
      _r.color(1, 0, 0, 1);
      scene.drawPoint(this.collisionPoint, 10);
    }
    // Draw reflection
    if (this._collisionReflection && this.collisionPoint) {
      _r.color(1, 0.5, 0, 1);
      scene.drawLine(this.collisionPoint, this.collisionPoint.add(this._collisionReflection));
    }
  }
}