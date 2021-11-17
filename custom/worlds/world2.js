class World2 extends World {
  constructor() {
    super("world2");
  }

  init() {
    super.init();

    this.ball.radius = 0.025;

    const level = ModelCache.newModel("MINIGOLF_Altitude_Hole10");
    level.position = new Vector(0, -1.667, 8.5)
    level.calcColour = Model.flatLighting;
    // level.texture = assets["snake_texture_2.tex"];
    this.addModel(level);

    const levelPhys = ModelCache.newModel("MINIGOLF_Altitude_Hole10");
    levelPhys.position = level.position;
    this.addPhysicsModel(levelPhys);

    const hole = new HoleEntity(this, new Vector(0, -1.679, 9.991), 0.32);

    const killPlane = new PlaneTrigger(new Vector(0, -3, 0), new Vector(0, -1, 0));
    killPlane.onBallEnter = () => {
      this.ball.outOfBounds();
    }
    this.addPhysicsTrigger(killPlane);
  }

  draw() {
    _r.color(0, 0.5, 1, 1);
    _r.rect(0, 0, _m.width, _m.height);

    _r.color(1, 1, 1, 1);
    this.drawSkybox(assets["skytexture_blue.tex"]);

    super.draw();
  }
}

WorldManager.registerWorld("world2", World2);