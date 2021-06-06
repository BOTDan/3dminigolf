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
    this.paused = false;
    this._debugDraw = [];
  }

  get colliders() { return this._colliders; }
  get gravityDirection() { return this._gravityDirection; }
  get gravityStrength() { return this._gravityStrength; }
  get timescale() { return this._timescale; }
  get paused() { return this._paused; }
  get ball() { return this._ball; }

  set colliders(value) { this._colliders = value; }
  set gravityDirection(value) { this._gravityDirection = value; }
  set gravityStrength(value) { this._gravityStrength = value; }
  set timescale(value) { this._timescale = value; }
  set paused(value) { this._paused = value; }
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

  /**
   * Think function to make physics work
   * @param {Number} dt deltaTime, or the time in seconds since the last think
   */
  think(dt) {
    this._debugDraw = [];
    if (this.paused) { return; }
    let remainingDistance = this.ball.velocity.length() * dt * this.timescale;
    let nextCollision = this.findNextCollision(remainingDistance);
    while (nextCollision) {
      this.processCollision(nextCollision);
      remainingDistance -= nextCollision.distance;
      nextCollision = this.findNextCollision(remainingDistance);
    }
    // No more collisions, move to the end of the line
    const remainingVelocity = this.ball.velocity.normalize().multiply(remainingDistance);
    this.ball.position = this.ball.position.add(remainingVelocity);
  }

  /**
   * Finds the nearest possible collision within range. Returns null if none found
   * @param {Number} distance The distance the collision must be within
   * @returns {Collision || null} The next nearest collision in range
   */
  findNextCollision(distance) {
    let nearestCollision = null;
    this.colliders.forEach((collider) => {
      const collision = collider.calcCollision();
      if (!collision) { return; }
      if (!nearestCollision) {
        nearestCollision = collision;
        return;
      }
      if (collision.distance < nearestCollision.distance) {
        nearestCollision = collision;
      }
    });
    if (!nearestCollision || nearestCollision.distance > distance) {
      // No collisions, move to end and finish
      return null;
    }
    return nearestCollision;
  }

  /**
   * Processes the given collision, moving the ball and altering velocity
   * @param {Collision} collision The collision to process
   */
  processCollision(collision) {
    this.ball.position = collision.position;
    this.ball.velocity = this.ball.velocity.reflect(collision.normal);
  }

  /**
   * Debug draw function
   * @param {Scene} scene The scene
   */
   debugDraw(scene) {
    this.colliders.forEach((collider) => {
      collider.debugDraw(scene);
    });
    this.ball.debugDraw(scene);
    this._debugDraw.forEach((obj) => {
      if (obj.colour) {
        _r.color(...obj.colour);
      } else {
        _r.color(1, 0, 0, 1);
      }
      switch(obj.type) {
        case 'point': {
          scene.drawPoint(obj.pos, 10);
          break;
        }
        case 'line': {
          scene.drawLine(obj.startPos, obj.endPos, 2);
          break;
        }
      }
    });
  }
}

/**
 * @class
 * @classdesc Represents a collision. Created by Colliders
 */
class PhysicsCollision {
  constructor(collider, position, distance, normal) {
    this.collider = collider;
    this.position = position;
    this.distance = distance;
    this.normal = normal;
  }

  set collider(value) { this._collider = value; }
  set position(value) { this._position = value; }
  set distance(value) { this._distance = value; }
  set normal(value) { this._normal = value; }

  get collider() { return this._collider; }
  get position() { return this._position; }
  get distance() { return this._distance; }
  get normal() { return this._normal; }
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
    // scene.drawLine(this.position, this.position.add(this.velocity));
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
   * @returns {PhysicsCollision} Collision data
   */
  calcCollision() {
    if (this.ball.velocity.dot(this.normal) > 0) {
      return null;
    }
    const hitData = util.getLineIntersection(
      this.ball.position,
      this.ball.position.add(this.ball.velocity),
      this.offsetPoints[0],
      this.normal
    );
    if (!hitData || hitData.distance < 0) {
      return null;
    }
    return new PhysicsCollision(this, hitData.point, hitData.distance, this.normal);
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
  }
}