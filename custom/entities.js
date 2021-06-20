/**
 * @class
 * @classdesc Represents the player's ball.
 */
class BallEntity {
  /**
   * Creates a new ball
   * @param {Scene} scene The scene to add the entity to
   * @param {Vector} position The position of the ball
   * @param {Number} radius The radius of the ball 
   */
  constructor(scene, position, radius) {
    this._scene = scene;
    this._physics = new PhysicsBall();
    this._model = ModelCache.newModel("DEBUG_Sphere");

    this.position = position;
    this.radius = radius;

    this.model.calcColour = Model.flatLighting;

    this.cameraAttached = false;
    this.cameraAngle = new Angle(0, 0, 0);
    this.cameraDistance = 1;
    
    this.scene.addModel(this.model);
    this.setupArrowModel();

    this.aimTarget = null;
  }

  get scene() { return this._scene; }
  get physics() { return this._physics; }
  get position() { return this.physics.position; }
  get velocity() { return this.physics.velocity; }
  get radius() { return this.physics.size; }
  get model() { return this._model; }
  get cameraAttached() { return this._cameraAttached; }
  get cameraAngle() { return this._cameraAngle; }
  get cameraDistance() { return this._cameraDistance;}
  get cameraPosition() {
    const awayVector = this.cameraAngle.getForward().multiply(this.cameraDistance);
    return this.position.subtract(awayVector);
  }
  get aimTarget() { return this._aimTarget; }
  get arrowHead() { return this._arrowHead; }
  get arrowBody() { return this._arrowBody; }

  set position(vector) {
    this.physics.position = vector;
    this.model.position = vector;
  }
  set velocity(vector) {
    this.physics.velocity = vector;
  }
  set radius(number) {
    this.physics.size = number;
    this.model.scale = new Vector(number, number, number);
  }
  set cameraAttached(boolean) {
    this._cameraAttached = boolean;
  }
  set cameraAngle(angle) {
    this._cameraAngle = angle;
  }
  set cameraDistance(number) {
    this._cameraDistance = number;
  }
  set aimTarget(vector) {
    this._aimTarget = vector;
    this.updateArrowModel();
  }

  update() {
    this.model.position = this.physics.position;
  }

  /**
   * Creates the arrow model used for targetting
   */
  setupArrowModel() {
    this._arrowHead = new Model(this.position);
    this._arrowBody = new Model(this.position);

    this.arrowHead.addVert(
      new Vector(-0.5, 0, 0),
      new Vector(0, 0, 0.5),
      new Vector(0.5, 0, 0)
    );
    this.arrowHead.addFace(new Face([0, 1, 2]));
    this.arrowHead.zIndex = 100;
    this.scene.addModel(this.arrowHead);

    this.arrowBody.addVert(
      new Vector(-0.5, 0, 0),
      new Vector(-0.5, 0, 1),
      new Vector(0.5, 0, 1),
      new Vector(0.5, 0, 0)
    );
    this.arrowBody.addFace(new Face([0, 1, 2, 3]));
    this.arrowBody.zIndex = 100;
    this.scene.addModel(this.arrowBody);
  }

  /**
   * Updates the arrow models length and rotation
   */
  updateArrowModel() {
    const hasTarget = (this.aimTarget !== null);
    this.arrowHead.visible = hasTarget;
    this.arrowBody.visible = hasTarget;
    if (!hasTarget) {
      return;
    }
    const dir = this.aimTarget.subtract(this.position);
    const dist = dir.length();
    this.arrowBody.position = this.position;
    this.arrowBody.rotation = dir.asAngle();
    this.arrowBody.scale = new Vector(this.radius*2, 1, dist);
    this.arrowHead.position = this.position.add(dir);
    this.arrowHead.rotation = dir.asAngle();
    this.arrowHead.scale = new Vector(this.radius*4, 1, this.radius*4);
  }
}