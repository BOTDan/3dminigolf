/**
 * @class
 * @classdesc A hole. The finish of the level.
 */
class HoleEntity {
  /**
   * Creates a new hole
   * @param {World} world The world to add the hole to
   * @param {Vector} position The position of the hole
   * @param {Number} scale The scale of the hole (default 1)
   */
  constructor(world, position, scale=1) {
    this._world = world;

    this._holeModel = ModelCache.newModel("TOWERUNITE_Hole");
    this.holeModel.calcColour = Model.flatLighting;
    
    this._holeTrigger = new CubeTrigger(
      position.add(new Vector(0, -0.125 * scale, 0)),
      new Vector(0.15 * scale, 0.05 * scale, 0.15 * scale)
    );
    this.holeTrigger.onBallEnter = () => {
      this.ball.pot();
    }

    this._flagModel = new Model(); // ModelCache.newModel("TOWERUNITE_Flag");
    this.flagModel.calcColour = Model.flatLighting;
    
    this.position = position;
    this.scale = scale;
    
    this.world.addModel(this.holeModel);
    this.world.addModel(this.flagModel);
    this.world.addPhysicsModel(this.holeModel);
    this.world.addPhysicsTrigger(this.holeTrigger);
  }

  /**
   * Updates the positions of the models after pos/scale change
   */
  updatePositions() {
    this.holeModel.position = this.position;
    this.holeTrigger.position = this.position.add(new Vector(0, -0.125 * this.scale, 0))
    this.flagModel.position = this.position;
  }

  get world() { return this._world; }
  get scene() { return this.world.scene; }
  get physics() { return this.world.physics; }
  get ball() { return this.world.ball; }
  get position() { return this._position; }
  get scale() { return this._scale; }
  get holeModel() { return this._holeModel; }
  get holeTrigger() { return this._holeTrigger; }
  get flagModel() { return this._flagModel; }

  set position(vector) {
    this._position = vector;
    this.updatePositions();
  }
  set scale(number) {
    this._scale = number;
    this.holeModel.scale = new Vector(number);
    this.holeTrigger.scale = new Vector(0.15 * number, 0.05 * number, 0.15 * number);
    this.flagModel.scale = new Vector(number);
    this.updatePositions();
  }
}