class World2 extends World {
  constructor() {
    super("world2");
  }

  init() {
    super.init();

    this.ball.radius = 0.025;


    const ground = ModelCache.newModel("TOWERUNITE_Altitude_10_Ground");
    ground.position = new Vector(0, -1.667, 8.5);
    ground.rotation = new Angle(0, -90, 0);
    ground.scale = new Vector(0.325);
    ground.calcColour = Model.flatColourLighting(util.RGBtoColour(44, 201, 16));
    // level.texture = assets["snake_texture_2.tex"];
    this.addModel(ground);

    const rail = ModelCache.newModel("TOWERUNITE_Altitude_10_Rail");
    rail.position = ground.position;
    rail.rotation = ground.rotation;
    rail.scale = ground.scale;
    rail.calcColour = Model.flatColourLighting(util.RGBtoColour(255, 255, 255), util.RGBtoColour(50, 50, 50));
    // level.texture = assets["snake_texture_2.tex"];
    this.addModel(rail);

    const phys = ModelCache.newModel("TOWERUNITE_Altitude_10_Phys");
    phys.position = ground.position;
    phys.rotation = ground.rotation;
    phys.scale = ground.scale;
    this.addPhysicsModel(phys);

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