/**
 * @class
 * @classdesc A world, used to group level models, physics etc.
 */
class World {
  constructor(name) {
    this.name = name || "default";
    this._scene = new Scene();

    this._physics = new PhysicsWorld();
    this.physics.paused = true;

    this._ball = new BallEntity(this.scene, new Vector(), 0.04);
    this.physics.ball = this.ball.physics;

    this.par = 0;

    this.init();
    this.start();
  }

  get name() { return this._name; }
  get par() { return this._par; }
  get scene() { return this._scene; }
  get physics() { return this._physics; }
  get ball() { return this._ball; }
  get camera() { return this.scene.camera; }

  set name(string) { this._name = string; }
  set par(number) { this._par = number; }

  /**
   * Adds the given model(s) to the world
   * @param  {...Model} models The model(s) to add
   */
  addModel(...models) {
    this.scene.addModel(...models);
  }

  /**
   * Adds the given model(s) to the physics simulation
   * @param  {...Model} models The model(s) to turn into physics
   */
  addPhysicsModel(...models) {
    models.forEach((model) => {
      physicsFromModel(model, this.physics);
    });
  }

  /**
   * Adds the given trigger(s) the the physics simulation
   * @param  {...PhysicsTrigger} triggers The trigger(s) to add
   */
  addPhysicsTrigger(...triggers) {
    triggers.forEach((trigger) => {
      this.physics.addTrigger(trigger);
    });
  }

  /**
   * Draws the skybox
   * NOTE: Texture should be square, and flipped vertically at midpoint so the bottom half of the
   * image is the regular skybox and the top is an upside-down copy.
   * @param {Texture} texture The texture to use
   */
  drawSkybox(texture) {
    // Define fov as a percentage of 360deg
    const fov = (this.camera.fov / 2) / 360;
    const fovY = (this.camera.fovY / 2) / 360;
    // Define where the middle of the texture is
    const uMiddle = -this.camera.rotation.yaw / 360;
    const vMiddle = 0.75 + (this.camera.rotation.pitch / 360);
    // Define an up and right angle based on roll
    const roll = this.camera.rotation.roll;
    const up = new Vector(-Math.sin(util.toRadians(roll)), Math.cos(util.toRadians(roll)));
    const right = new Vector(up.y, -up.x);
    // Create the UVs
    let uvs = [
      new Vector(-fov, -fovY),
      new Vector(fov, -fovY),
      new Vector(fov, fovY),
      new Vector(-fov, fovY),
    ].map((uv) => {
      const x = right.multiply(uv.x);
      const y = up.multiply(uv.y);
      const offset = x.add(y);
      return new Vector(uMiddle + offset.x, vMiddle + offset.y);
    });
    // Draw the skybox
    _r.layer++;
    _r.quad(
      0,        0,         uvs[0].x, uvs[0].y,
      _m.width, 0,         uvs[1].x, uvs[1].y,
      _m.width, _m.height, uvs[2].x, uvs[2].y,
      0,        _m.height, uvs[3].x, uvs[3].y,
      texture
    );
  }

  /**
   * Think hook. Called at regular intervals to handle physics etc.
   * @param {Number} dt deltaTime
   */
  think(dt) {
    this.physics.think(dt);
    this.ball.think(dt);
    this.scene.think(dt);
  }

  /**
   * Draw hook. Called every frame
   */
  draw() {
    _r.layer++;
    this.scene.draw();
    this.physics.draw(this.scene);
    GameBase.Debug.AddOverlay(`Ball Hits: ${this.ball.hits}`);
  }

  /**
   * Overwrite: Called when this world is initialised
   */
  init() {
    return;
  }

  /**
   * Overwrite: Called once everything has initialised
   */
  start() {
    return;
  }

  /**
   * Overwrite: Called when this world is unloaded
   */
  destroy() {
    return;
  }
}

const WorldManager = {
  activeWorld: null,
  registeredWorlds: {},

  /**
   * Registers a world for use in the game
   * @param {World} world The world to register
   */
  registerWorld(name, world) {
    this.registeredWorlds[name] = world;
  },

  /**
   * 
   * @param {string || World} name The name of the world to load 
   * @returns {World}
   */
  loadWorld(world) {
    if (typeof world === "string") {
      if (!this.registeredWorlds[world]) {
        return null;
      }
    }
    if (this.activeWorld) {
      this.activeWorld.destroy();
    }
    const newWorld = (typeof world === "string") ? this.registeredWorlds[world] : world;
    if (!newWorld) {
      return null;
    }
    this.activeWorld = new newWorld();
    return this.activeWorld;
  },

  /**
   * Returns true if the given world name has been registered
   * @param {String} name The name of the world
   * @returns {Boolean} If the world name has been registered
   */
  doesWorldExist(name) {
    return this.registeredWorlds[name] !== undefined;
  }
}
