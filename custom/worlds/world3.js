class World3 extends World {
  constructor() {
    super("world3");
  }

  init() {
    super.init();

    this.par = 2;

    this.ball.radius = 0.025;

    const ground = ModelCache.newModel("TOWERUNITE_Altitude_4_Ground");
    ground.position = new Vector(0, -0.019, 0.65);
    ground.rotation = new Angle(0, -90, 0);
    ground.scale = new Vector(0.325);
    ground.calcColour = Model.flatColourLighting(util.RGBtoColour(44, 201, 16));
    this.addModel(ground);

    const rail = ModelCache.newModel("TOWERUNITE_Altitude_4_Rail");
    rail.position = ground.position;
    rail.rotation = ground.rotation;
    rail.scale = ground.scale;
    rail.calcColour = Model.flatColourLighting(util.RGBtoColour(255, 255, 255), util.RGBtoColour(50, 50, 50));
    this.addModel(rail);

    const phys = ModelCache.newModel("TOWERUNITE_Altitude_4_Phys");
    phys.position = ground.position;
    phys.rotation = ground.rotation;
    phys.scale = ground.scale;
    this.addPhysicsModel(phys);

    const hole = new HoleEntity(this, new Vector(-0.01, -0.929, -0.9783), 0.32);

    const killPlane = new PlaneTrigger(new Vector(0, -2, 0), new Vector(0, -1, 0));
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

WorldManager.registerWorld("world3", World3);