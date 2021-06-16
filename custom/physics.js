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
    this.gravityStrength = 7;
    this.timescale = 1;
    this.paused = false;
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
    this.applyGravity(dt);
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

  applyGravity(dt) {
    this.ball.velocity = this.ball.velocity.add(this.gravityDirection.multiply(this.gravityStrength * dt * this.timescale));
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
 * @classdesc A generic collider. Should be extended
 */
class PhysicsCollider {
  get ball() { return this._ball; }
  get ballSize() { return this._ballSize; }

  set ball(value) {
    this._ball = value;
    this.calcOffsetPosition();
  }

  /**
   * OVERWRITE: Calculates the closest collision with this collider
   * @returns {PhysicsCollision} Collision data
   */
  calcCollision() {
    return null;
  }

  /**
   * OVERWRITE: Debug draw function
   * @param {Scene} scene A scene object for 3D rendering
   */
  debugDraw(scene) {
    return;
  }
}

/**
 * @class
 * @classdesc A collider representing part of a plane in 3D space
 */
class PlaneCollider extends PhysicsCollider {
  /**
   * Creates a plane for collision
   * @param {Vector} pos The position of the plane
   * @param {Vector} normal The normal of the plane
   * @param {Boolean} flipNormal If the normal should be flipped
   */
  constructor(pos, normal, flipNormal=false) {
    super();
    this.position = pos;
    this.flipNormal = flipNormal;
    this.normal = flipNormal ? normal.invert() : normal;
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get offsetPosition() { return this._offsetPosition; }
  get normal() { return this._normal; }
  get flipNormal() { return this._flipNormal; }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set normal(value) { this._normal = value; }
  set flipNormal(value) { this._flipNormal = value; }
  
  /**
   * Pre-calculates offset points
   */
   calcOffsetPosition() {
    this._offsetPosition = this.position.add(this.normal.multiply(this.ball.size));
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
      this.offsetPosition,
      this.normal
    );
    if (!hitData || hitData.distance < -0.00001) {
      return null;
    }
    if (!this.isValidCollision(hitData.point, hitData.distance)) {
      return null;
    }
    return new PhysicsCollision(this, hitData.point, hitData.distance, this.normal);
  }

  /**
   * Checks if the given collision point is valid
   * @param {Vector} point The point of the collision
   * @param {Number} distance The distance the ball is from the collision point
   * @returns {Boolean}
   */
  isValidCollision(point, distance) {
    return true;
  }

  /**
   * Debug draw function
   * @param {Scene} scene The scene, for rendering
   */
  debugDraw(scene) {
    // Draw the initial plane points
    _r.color(1, 1, 1, 1);
    scene.drawLine(this.position, this.offsetPosition);
    scene.drawPoint(this.position, 10);
    // Debug
    const ang = this.normal.asAngle();
    _r.color(1, 0, 0, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getForward().multiply(this.ball.size / 2)));
    _r.color(0, 1, 0, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getUp().multiply(this.ball.size / 2)));
    _r.color(0, 0, 1, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getRight().multiply(this.ball.size / 2)));
  }

  /**
   * Creates a plane collider with edges between the 4 points
   * @param {Vector} point1 The first point
   * @param {Vector} point2 The second point
   * @param {Vector} point3 The third point
   * @param {Vector} point4 The forth point
   * @returns {PlaneCollider} A plane collider with bouds of the 4 points
   */
  static Quadrilateral(points, flipNormal) {
    let normal = util.findNormal(points);
    if (!normal) { return null; }
    if (flipNormal) {
      normal = normal.invert();
    }
    const collider = new PlaneCollider(points[0], normal);
    const normalAngle = normal.asAngle();
    const points2d = points.map((point) => {return util.pointToPlane(point, points[0], normalAngle)});
    collider.isValidCollision = (point, distance) => {
      let sign = 0;
      const point2d = util.pointToPlane(point, points[0], normalAngle);
      for (let i=0; i < points2d.length; i++) {
        const current = points2d[i];
        const next = points2d[(i+1) % points2d.length];
        const calc = (point2d.x - current.x) * (next.y - current.y) - (next.x - current.x) * (point2d.y - current.y);
        const calcSign = Math.sign(calc);
        if (sign === 0) {
          sign = calcSign;
        } else {
          if (calcSign !== sign && calcSign !== 0) {
            return false;
          }
        }
      }
      return true;
    }
    const oldDebugDraw = collider.debugDraw.bind(collider);
    collider.debugDraw = (scene) => {
      oldDebugDraw(scene);
      _r.color(1, 1, 1, 1);
      for (let i=0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i+1) % points.length];
        scene.drawLine(current, next);
      }
      _r.color(1, 0, 0, 0.5);
      const offset = collider.normal.multiply(collider.ball.size);
      for (let i=0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i+1) % points.length];
        scene.drawLine(current.add(offset), next.add(offset));
      }
    }
    return collider;
  }
}

/**
 * Generates collisions for the given model and adds it to the world if provided
 * @param {Model} model The model to add physics to
 * @param {PhysicsWorld} physWorld The world to add the collision to
 */
function physicsFromModel(model, physWorld) {
  model.updateWorldVerts();
  const colliders = model.faces.map((face) => {
    const verts = face.verts.map((vert) => model.worldVerts[vert]);
    const collider = PlaneCollider.Quadrilateral(verts, face.flipNormal);
    if (physWorld) {
      physWorld.addCollider(collider);
    }
    return collider;
  });
  return colliders;
}