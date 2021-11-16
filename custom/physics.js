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
    this.triggers = [];
    this.gravityDirection = new Vector(0, -1, 0);
    this.gravityStrength = 7;
    this.timescale = 1;
    this.paused = false;
    this.drawColliders = false;
    this.drawTriggers = true;
    this.drawTrail = true;
    this._drawOps = [];
  }

  get colliders() { return this._colliders; }
  get gravityDirection() { return this._gravityDirection; }
  get gravityStrength() { return this._gravityStrength; }
  get timescale() { return this._timescale; }
  get paused() { return this._paused; }
  get ball() { return this._ball; }
  get drawColliders() { return this._drawColliders; }
  get drawTrail() { return this._drawTrail; }

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
  set drawColliders(value) { this._drawColliders = value; }
  set drawTrail(value) { this._drawTrail = value; }
  
  /**
   * Adds a physics collider to the world
   * @param {Collider} collider The collider to add
   */
  addCollider(collider) {
    this.colliders.push(collider);
    collider.ball = this.ball;
  }

  addTrigger(trigger) {
    this.triggers.push(trigger);
    trigger.ball = this.ball;
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
    this.ball.updateAABB();
    let nextCollision = this.findNextCollision(remainingDistance);
    while (nextCollision) {
      this.processCollision(nextCollision);
      remainingDistance -= Math.sqrt(nextCollision.distanceSqr);
      this.ball.updateAABB();
      nextCollision = this.findNextCollision(remainingDistance, nextCollision.collider);
    }
    // No more collisions, move to the end of the line
    const remainingVelocity = this.ball.velocity.normalize().multiply(remainingDistance);
    const oldPosition = this.ball.position;
    this.ball.position = this.ball.position.add(remainingVelocity);
    this.addDebugDraw(new PhysicsDrawLine(oldPosition, this.ball.position));
    // Calculate triggers
    this.ball.updateStaticAABB();
    this.processTriggers();
  }

  /**
   * Finds the nearest possible collision within range. Returns null if none found
   * @param {Number} distance The distance the collision must be within
   * @returns {Collision || null} The next nearest collision in range
   */
  findNextCollision(distance, ignore=null) {
    let nearestCollision = null;
    this.colliders.forEach((collider) => {
      if (collider === ignore) { return; }
      const collision = collider.calcCollision();
      if (!collision) { return; }
      if (!nearestCollision) {
        nearestCollision = collision;
        return;
      }
      if (collision.distanceSqr < nearestCollision.distanceSqr) {
        nearestCollision = collision;
      }
    });
    if (!nearestCollision || nearestCollision.distanceSqr > distance*distance) {
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
    const oldPosition = this.ball.position;
    this.ball.position = collision.position.add(collision.normal.multiply(0.001));
    this.ball.velocity = this.ball.velocity.reflect(collision.normal);
    this.addDebugDraw(new PhysicsDrawLine(oldPosition, this.ball.position));
    this.addDebugDraw(new PhysicsDrawLine(this.ball.position, this.ball.position.add(collision.normal.multiply(0.1)), [1, 0, 0]));
    // Restitution
    const amount = collision.normal.dot(this.ball.velocity);
    const impact = collision.normal.multiply(amount * 0.5);
    this.ball.velocity.x = this.ball.velocity.x - impact.x;
    this.ball.velocity.y = this.ball.velocity.y - impact.y;
    this.ball.velocity.z = this.ball.velocity.z - impact.z;
    // Friction
    const right = collision.normal.cross(this.ball.velocity);
    const forward = right.cross(collision.normal); // This is the full force along this vector, not normalised
    // const paralellness = this.ball.velocity.normalize().dot(forward.normalize());
    // New: Closer to 1.0 = closer to paralell to plane
    let friction = forward.invert().normalize();
    const factor = Math.max(Math.min(forward.length() * 0.01, 0.01), 0.005)
    friction = friction.multiply(factor);
    // this.addDebugDraw(new PhysicsDrawLine(this.ball.position, this.ball.position.add(friction.multiply(5)), [0, 1, 0]));
    this.ball.velocity.x = clampedSubtract(this.ball.velocity.x, -friction.x);
    this.ball.velocity.y = clampedSubtract(this.ball.velocity.y, -friction.y);
    this.ball.velocity.z = clampedSubtract(this.ball.velocity.z, -friction.z);
    this.ball.updateStaticAABB();
  }

  /**
   * Updates the balls rotation given the move vector
   * @param {Vector} forward The forward vector the ball moved
   * @param {Number} dist The distance the ball moved
   */
  updateRotation(forward, dist) {
    dist = dist || forward.length();
    const right = this.gravityDirection.cross(forward).normalize();
    const angle = dist / (2 * Math.PI * this.ball.radius) * 360;
    const forwardAngle = forward.asAngle();
    const newAngle = this.ball.rotation.getForward().normalize().rotateAroundAxis(right, -angle);
    this.addDebugDraw(new PhysicsDrawLine(this.ball.position, this.ball.position.add(newAngle.multiply(0.1)), [0, 1, 1]));
    // this.addDebugDraw(new PhysicsDrawLine(this.ball.position, this.ball.position.add(right), [0, 0, 1]));
    this.ball.rotation = newAngle.asAngle();
  }

  /**
   * Applies gravity to the ball
   * @param {Number} dt deltaTime
   */
  applyGravity(dt) {
    this.ball.velocity = this.ball.velocity.add(this.gravityDirection.multiply(this.gravityStrength * dt * this.timescale));
  }

  /**
   * Checks if the ball is colliding with any triggers
   */
  processTriggers() {
    this.triggers.forEach((trigger) => {
      trigger.calcTrigger();
    });
  }

  /**
   * Adds a physics debug draw 
   * @param {PhysicsDraw} op The draw to add
   */
  addDebugDraw(op) {
    this._drawOps.push(op);
  }

  /**
   * Debug draw function
   * @param {Scene} scene The scene
   */
  draw(scene) {
    if (this.drawColliders) {
      this.colliders.forEach((collider) => {
        collider.debugDraw(scene);
      });
    }
    if (this.drawTriggers) {
      this.triggers.forEach((trigger) => {
        trigger.debugDraw(scene);
      });
    }
    if (this.drawTrail) {
      this.ball.debugDraw(scene);
      this._drawOps.forEach((op) => {
        op.draw(scene);
      });
      this._drawOps = this._drawOps.filter((op) => {
        if (op.life <= 0) {
          op.remove();
          return false;
        }
        return true;
      });
    }
  }
}

/**
 * @class
 * @classdesc Debug draw base class for physics
 */
class PhysicsDraw {
  /**
   * Base draw class for debug physics draws
   * @param {String} type The name of the draw
   * @param {Number} lifetime The duration of the draw, in seconds
   */
  constructor(type, lifetime) {
    this.type = type || "base";
    this.startTime = Date.now();
    this.lifeTime = lifetime || 5;
    this.colour = [1, 1, 1, 1];
  }

  get type() { return this._type; }
  get startTime() { return this._startTime; }
  get lifeTime() { return this._lifeTime; }
  get life() { return Math.max(1 - (Date.now() - this.startTime) / (this.lifeTime*1000), 0) }
  get colour() { return this._colour; }

  set type(name) { this._type = name; }
  set startTime(time) { this._startTime = time; }
  set lifeTime(time) { this._lifeTime = time; }
  set colour(colour) { this._colour = colour; }

  /**
   * Overwritable draw function
   * @param {Scene} scene The scene object to draw to
   */
  draw(scene) {
    return;
  }

  /**
   * Overwritable remove function
   */
  remove() {
    return;
  }
}

/**
 * @class
 * @classdesc Debug line drawing class
 */
class PhysicsDrawLine extends PhysicsDraw {
  /**
   * Creates a debug line to render
   * @param {Vector} startPos The start of the line
   * @param {Vector} endPos The end of the line
   * @param {Number} lifetime The life of the line, in seconds
   * @param {Colour} colour The colour of the line
   */
  constructor(startPos, endPos, colour, lifetime) {
    super("line");
    this.startPos = startPos;
    this.endPos = endPos;
    if (lifetime) {
      this.lifeTime = lifetime;
    }
    if (colour) {
      this.colour = colour;
    }
  }

  /**
   * Draws this line to the screen
   * @param {Scene} scene The scene to draw to
   */
  draw(scene) {
    const colour = this.colour;
    const a = (colour[3] || 1) * this.life;
    _r.color(colour[0], colour[1], colour[2], a);
    scene.drawLine(this.startPos, this.endPos);
  }
}

/**
 * @class
 * @classdesc Represents a collision. Created by Colliders
 */
class PhysicsCollision {
  constructor(collider, position, distanceSqr, normal) {
    this.collider = collider;
    this.position = position;
    this.distanceSqr = distanceSqr;
    this.normal = normal;
  }

  set collider(value) { this._collider = value; }
  set position(value) { this._position = value; }
  set distanceSqr(value) { this._distance = value; }
  set normal(value) { this._normal = value; }

  get collider() { return this._collider; }
  get position() { return this._position; }
  get distanceSqr() { return this._distance; }
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
   * @param {Number} radius The radius of the ball 
   */
  constructor(pos, radius=0.1) {
    this.position = pos;
    this.rotation = new Angle(0, 0, 0);
    this.velocity = new Vector(0, 0, 0);
    this.radius = radius;
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get rotation() { return this._rotation; }
  get velocity() { return this._velocity; }
  get radius() { return this._radius; }
  get aabb() {
    if (!this._aabb) {
      this._aabb = this.calcAABB();
    }
    return this._aabb;
  }
  get staticAABB() {
    if (!this._staticAABB) {
      this._staticAABB = this.calcStaticAABB();
    }
    return this._staticAABB;
  }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set rotation(value) { this._rotation = value; }
  set velocity(value) { this._velocity = value; }
  set radius(value) { this._radius = value; }

  /**
   * Returns the AABB for where the ball will move in 1 second
   * @param {Number} dt deltaTime
   * @returns {min: Vector, max: Vector} The min and max of the AABB for the balls movement
   */
  calcAABB(dt=1) {
    return {
      min: this.position.min(this.position.add(this.velocity.multiply(dt))),
      max: this.position.max(this.position.add(this.velocity.multiply(dt))),
    };
  }

  /**
   * Returns the AABB for the ball if static at this moment
   * @returns {min: Vector, max: Vector} The min and max of the AABB for the ball if stationary
   */
  calcStaticAABB() {
    return {
      min: this.position.min(this.position.subtract(this.radius)),
      max: this.position.max(this.position.add(this.radius)),
    }
  }

  /**
   * Updates the AABB for the balls movement
   * @param {Number} dt deltaTime
   */
  updateAABB(dt=1) {
    this._aabb = this.calcAABB(dt);
  }

  /**
   * Updates the AABB for the ball if considered static
   */
  updateStaticAABB() {
    this._staticAABB = this.calcStaticAABB();
  }

  /**
   * Debug draw function
   * @param {Scene} scene The scene, for rendering
   */
  debugDraw(scene) {
    _r.color(0, 1, 0, 1);
    // scene.drawPoint(this.position, 10);
    _r.color(0.5, 1, 0, 1);
    // scene.drawLine(this.position, this.position.add(this.velocity));
  }
}

let physDebugCounter = 0;
/**
 * @class
 * @classdesc A generic collider. Should be extended
 */
class PhysicsCollider {
  get ball() { return this._ball; }
  get aabb() {
    if (!this._aabb) {
      this._aabb = this.calcAABB();
    }
    return this._aabb;
  }

  set ball(value) {
    this._ball = value;
    this.onBallUpdated();
  }

  /**
   * Creates a new physics collider
   */
  constructor() {
    this._debugId = physDebugCounter;
    physDebugCounter++;
  }

  /**
   * OVERWRITE: Called when the ball is changed for this collider
   */
  onBallUpdated() {
    return;
  }

  /**
   * OVERWRITE: Calculates the closest collision with this collider
   * @returns {PhysicsCollision} Collision data
   */
  calcCollision() {
    return null;
  }

  /**
   * Returns an axis-aligned bounding box for this collider
   * @returns {min: Vector, max: Vector} The min and max point of the AABB
   */
  calcAABB() {
    return {
      min: new Vector(-Infinity, -Infinity, -Infinity),
      max: new Vector(Infinity, Infinity, Infinity),
    };
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
  onBallUpdated() {
    this._offsetPosition = this.position.add(this.normal.multiply(this.ball.radius));
  }

  /**
   * Works out where the ball would cross the plane
   * @returns {PhysicsCollision} Collision data
   */
  calcCollision() {
    if (!util.checkOverlapAABB(this.ball.aabb, this.aabb)) {
      return null;
    }
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
    return new PhysicsCollision(this, hitData.point, Math.pow(hitData.distance, 2), this.normal);
  }

  /**
   * Returns an axis-aligned bounding box for this collider
   * @returns {min: Vector, max: Vector} The min and max point of the AABB
   */
  calcAABB() {
    return {
      min: new Vector(-Infinity, -Infinity, -Infinity),
      max: new Vector(Infinity, Infinity, Infinity),
    };
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
    scene.drawLine(this.position, this.position.add(ang.getForward().multiply(this.ball.radius / 2)));
    _r.color(0, 1, 0, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getUp().multiply(this.ball.radius / 2)));
    _r.color(0, 0, 1, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getRight().multiply(this.ball.radius / 2)));
  }

  /**
   * Creates a plane collider with edges between the 4 points
   * @param {Vector[]} points The points on the polygon
   * @param {Boolean} flipNormal If the normal of the polygon should be flipped
   * @returns {PlaneCollider} A plane collider with bouds of the 4 points
   */
  static Polygon(points, flipNormal) {
    // Get the normal of the plane
    let normal = util.findNormal(points);
    if (!normal) { return null; }
    if (flipNormal) {
      normal = normal.invert();
    }
    const collider = new PlaneCollider(points[0], normal);
    const normalAngle = normal.asAngle();
    const points2d = points.map((point) => {return util.pointToPlane(point, points[0], normalAngle)});
    // Overwrite isValidCollision check to make sure collision is within edges of quad
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
    // Overwrite calcAABB check to actually give the plane a bounding box
    collider.calcAABB = () => {
      let min = points[0];
      let max = points[0];
      for (let i=1; i<points.length; i++) {
        min = min.min(points[i]);
        max = max.max(points[i]);
      }
      const offset = normal.multiply(collider.ball.radius);
      return {
        min: min.add(offset),
        max: max.add(offset),
      };
    }
    // Overwrite the debugDraw to show the outline of the plane
    const oldDebugDraw = collider.debugDraw.bind(collider);
    collider.debugDraw = (scene) => {
      // oldDebugDraw(scene);
      // Draw default points
      _r.color(1, 1, 1, 0.2);
      for (let i=0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i+1) % points.length];
        scene.drawLine(current, next);
      }
      // Draw offset points
      _r.color(0, 1, 0, 1);
      const offset = collider.normal.multiply(collider.ball.radius);
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
 * @class
 * @classdesc A collider representing part of a cylinder in 3d space
 */
class CylinderCollider extends PhysicsCollider {
  /**
   * Creates a new Cylinder collider from startPos to endPos with radius r
   * @param {Vector} startPos The start position of the cylinder
   * @param {Vector} endPos The end position of the cylinder
   * @param {Number} radius The radius of the cylinder
   */
  constructor(startPos, endPos, radius=0) {
    super();
    this.startPos = startPos;
    this.endPos = endPos;
    this.radius = radius;
    this.calcMatricies();
  }

  get startPos() { return this._startPos; }
  get endPos() { return this._endPos; }
  get radius() { return this._radius; }
  get transformationMatrix() { return this._transformationMatrix; }
  get inverseTransformationMatrix() { return this._inverseTransformationMatrix; }

  set startPos(value) { this._startPos = value; }
  set endPos(value) { this._endPos = value; }
  set radius(value) { this._radius = value; }

  /**
   * Pre-calculates the transformation matricies needed for calculations
   */
  calcMatricies() {
    const normal = this.startPos.subtract(this.endPos).normalize();
    const translationMatrix = this.startPos.invert().getTranslationMatrix();
    const rotationMatrix = normal.asAngle().getRotationMatrix();
    this._transformationMatrix = translationMatrix.multiply(rotationMatrix);
  }

  /**
   * Works out where the ball would cross the cylinder
   * @returns {PhysicsCollision} Collision data
   */
  calcCollision() {
    if (!util.checkOverlapAABB(this.ball.aabb, this.aabb)) {
      return null;
    }
    const ballStart = this.ball.position;
    const ballEnd = this.ball.position.add(this.ball.velocity);
    const transformedBallStart = ballStart.multiplyMatrix(this.transformationMatrix);
    const transformedBallEnd = ballEnd.multiplyMatrix(this.transformationMatrix);
    const radius = this.radius + this.ball.radius;
    // Find where line crosses circle
    const results = lineIntersectCircle(transformedBallStart, transformedBallEnd, radius);
    const points = results.map((result) => {
      const point = this.ball.position.add(ballEnd.subtract(ballStart).multiply(result));
      return point;
    });
    // If no points, return null
    if (points.length === 0) {
      return null;
    }
    // Get the closest point
    const point = (points.length === 1)
      ? points[0]
      : (this.ball.position.distanceSqr(points[0]) < this.ball.position.distanceSqr(points[1]))
        ? points[0]
        : points[1];
    // Find the normal of the collision
    const normalStart = util.closestPointOnLine(point, this.startPos, this.endPos, true);
    if (!normalStart) {
      return null;
    }
    const normal = point.subtract(normalStart).normalize();
    const distance = this.ball.position.distanceSqr(point);
    return new PhysicsCollision(this, point, distance, normal);
  }

  /**
   * Returns the AABB for this collider
   * @returns {min: Vector, max: Vector} The mins and max of the AABB
   */
  calcAABB() {
    const min = this.startPos.min(this.endPos);
    const max = this.startPos.max(this.endPos);
    const offset = this.radius + this.ball.radius;
    return {
      min: min.subtract(offset),
      max: max.add(offset),
    };
  }

  /**
   * Debug draw function
   * @param {Scene} scene The scene, for rendering
   */
  debugDraw(scene) {
    _r.color(1, 1, 1, 0.2);
    scene.drawLine(this.startPos, this.endPos);
  }
}

/**
 * Generates collisions for the given model and adds it to the world if provided
 * @param {Model} model The model to add physics to
 * @param {PhysicsWorld} physWorld The world to add the collision to
 */
function physicsFromModel(model, physWorld) {
  model.updateWorldVerts();
  const colliders = [];
  const edgePairs = [];
  model.faces.forEach((face) => {
    const verts = face.verts.map((vert) => model.worldVerts[vert]);
    const collider = PlaneCollider.Polygon(verts, face.flipNormal);
    colliders.push(collider);
    for (let i=0; i < verts.length; i++) {
      const current = verts[i];
      const next = verts[(i+1) % verts.length];
      // Check that edge hasn't been made yet
      const found = edgePairs.some(([startPos, endPos]) =>{
        if ((startPos.equals(current) && endPos.equals(next)) || (startPos.equals(next) && endPos.equals(current))) {
          return true;
        }
        return false;
      });
      if (!found) {
        const edgeCollider = new CylinderCollider(current, next);
        colliders.push(edgeCollider);
        edgePairs.push([current, next]);
      }
    }
  });
  if (physWorld) {
    colliders.forEach((collider) => { physWorld.addCollider(collider); });
  }
  return colliders;
}

/**
 * Similar to Math.max but keeps the sign of the first number
 * @param {Number} number 
 * @param {Number} max
 * @returns 
 */
function mathMaxWithSign(number, max) {
  if (Math.sign(number) < 0) {
    return Math.min(number, -max);
  }
  return Math.max(number, max);
}

/**
 * Subtracts a number from another, preventing the sign from switching
 * @param {Number} number The starting number
 * @param {Number} amount The number to subtract
 * @returns {Number} The subtracted number, clamped to 0
 */
function clampedSubtract(number, amount) {
  const sign = Math.sign(number);
  number = number * sign;
  const result = Math.max(number - (amount * sign), 0);
  return result * sign;
}

/**
 * Returns the distances along the given line where it crosses a circle at (0,0) with radius r
 * @param {Vector} lineStart The start of the line
 * @param {Vector} lineEnd The end of the line
 * @param {Number} radius The radius of the circle
 * @returns {Number[]} The distances along line where the intersections occur
 */
function lineIntersectCircle(lineStart, lineEnd, radius) {
  const a = lineStart.copy();
  const b = lineEnd.copy();
  a.z = 0;
  b.z = 0;
  const diff = a.subtract(b);
  const diffLenSqr = diff.lengthSqr();
  const t = a.dot(diff) / diffLenSqr;
  const distSqr = a.lengthSqr() - t*t * diffLenSqr;
  if (distSqr > radius*radius) {
    // Distance > radius, so no intersection
    return [];
  }
  const k = Math.sqrt((radius*radius - distSqr) / diffLenSqr);
  const results = [];
  // Check if the positive result is valid (between 0-1)
  if (t+k >= 0 && t+k <= 1) {
    results.push(t+k);
  }
  // Check if the negative result is valid (between 0-1)
  if (t-k >= 0 && t-k <= 1) {
    results.push(t-k);
  }
  return results;
}

/**
 * @class
 * @classdesc A generic trigger. Should be extended.
 */
class PhysicsTrigger {
  get ball() { return this._ball; }
  get isBallInside() { return this._isBallInside; }
  get aabb() {
    if (!this._aabb) {
      this._aabb = this.calcAABB();
    }
    return this._aabb;
  }

  set ball(value) {
    this._ball = value;
    this.onBallUpdated();
  }
  set isBallInside(boolean) {
    const oldValue = this.isBallInside;
    this._isBallInside = boolean;
    if (oldValue !== boolean) {
      if (boolean) {
        this.onBallEnter();
      } else {
        this.onBallLeave();
      }
    }
  }

  /**
   * Creates a new physics trigger
   */
  constructor() {
    // Do nothing
  }

  /**
   * OVERWRITE: Called when the ball is changed for this trigger
   */
  onBallUpdated() {
    return;
  }

  /**
   * OVERWRITE: Called when the ba;; enters the trigger
   */
  onBallEnter() {
    return;
  }

  /**
   * OVERWRITE: Called when the ball leaves the trigger
   */
  onBallLeave() {
    return;
  }

  /**
   * OVERWRITE: Called every frame the ball is in the trigger
   */
  onBallInside() {
    return;
  }

  /**
   * Works out of this ball is colliding with the trigger
   */
  calcTrigger() {
    return;
  }

  /**
   * Returns an axis-aligned bounding box for this trigger
   * @returns {min: Vector, max: Vector} The min and max point of the AABB
   */
  calcAABB() {
    return {
      min: new Vector(-Infinity, -Infinity, -Infinity),
      max: new Vector(Infinity, Infinity, Infinity),
    };
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
 * @classdesc An axis-aligned cube collider
 */
class CubeTrigger extends PhysicsTrigger {
  /**
   * Creates an axis-aligned cube trigger
   * @param {Vector} pos The center of the cube
   * @param {Vector} size The size of the cube
   */
  constructor(pos, size=new Vector(1, 1, 1)) {
    super();
    this.position = pos;
    this.size = size;
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get size() { return this._size; }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set size(value) { this._size = value; }

  calcAABB() {
    return {
      min: this.position.subtract(this.size.positive()),
      max: this.position.add(this.size.positive())
    };
  }

  calcTrigger() {
    if (util.checkOverlapAABB(this.ball.staticAABB, this.aabb)) {
      this.isBallInside = true;
      this.onBallInside();
    } else {
      this.isBallInside = false;
    }
  }

  debugDraw(scene) {
    if (this.isBallInside) {
      _r.color(1, 0.5, 0, 1);
    } else {
      _r.color(1, 0.5, 0, 0.5);
    }
    scene.drawCube(this.aabb.min, this.aabb.max);
  }
}

class PlaneTrigger extends PhysicsTrigger {
  /**
   * Creates a plane as a trigger
   * @param {Vector} pos The position of the plane
   * @param {Vector} normal The normal of the plane
   * @param {Boolean} flipNormal If the normal should be flipped
   */
  constructor(pos, normal, flipNormal = false) {
    super();
    this.position = pos;
    this.flipNormal = flipNormal;
    this.normal = flipNormal ? normal.invert() : normal;
  }

  get position() { return this._position; }
  get pos() { return this.position; }
  get normal() { return this._normal; }
  get flipNormal() { return this._flipNormal; }

  set position(value) { this._position = value; }
  set pos(value) { this.position = value; }
  set normal(value) { this._normal = value; }
  set flipNormal(value) { this._flipNormal = value; }

  calcAABB() {
    return {
      min: new Vector(-Infinity, -Infinity, -Infinity),
      max: new Vector(Infinity, Infinity, Infinity),
    };
  }

  calcTrigger() {
    // Don't need to do AABB check, as AABB is always infinate
    const ballPos = this.ball.position;
    const dir = ballPos.subtract(this.position);
    const amount = this.normal.dot(dir);
    if (amount > 0) {
      this.isBallInside = true;
      this.onBallInside();
    } else {
      this.isBallInside = false;
    }
  }

  debugDraw(scene) {
    // Draw the initial plane points
    _r.color(1, 1, 1, 1);
    scene.drawLine(this.position, this.position.add(this.normal));
    scene.drawPoint(this.position, 10);
    // Debug
    const ang = this.normal.asAngle();
    _r.color(1, 0, 0, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getForward().multiply(1 / 2)));
    _r.color(0, 1, 0, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getUp().multiply(1 / 2)));
    _r.color(0, 0, 1, 0.5);
    scene.drawLine(this.position, this.position.add(ang.getRight().multiply(1 / 2)));
  }
}