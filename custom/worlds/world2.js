class World2 extends World {
  constructor() {
    super("world2");
  }

  init() {
    super.init();

    this.ball.position.y = 1;
    this.ball.radius = 0.025;

    const level = ModelCache.newModel("MINIGOLF_Altitude_Hole10");
    level.calcColour = Model.flatLighting;
    // level.texture = assets["snake_texture_2.tex"];
    this.addModel(level);

    const levelPhys = ModelCache.newModel("MINIGOLF_Altitude_Hole10");
    levelPhys.position = level.position;
    this.addPhysicsModel(levelPhys);

    const testTrigger = new CubeTrigger(new Vector(0, 0, 0), new Vector(1, 1, 1));
    this.addPhysicsTrigger(testTrigger);

    const planeTrigger = new PlaneTrigger(new Vector(0, -2, 0), new Vector(0, -1, 0));
    planeTrigger.onBallEnter = () => {
      this.ball.velocity = new Vector(0, 0, 0);
      this.ball.position = this.ball.lastStationaryPos;
    }
    this.addPhysicsTrigger(planeTrigger);
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