class World1 extends World {
  constructor() {
    super("world1");
  }

  init() {
    super.init();

    const snake = ModelCache.newModel("DEBUG_Snake_UVs");
    snake.calcColour = Model.flatLighting;
    snake.texture = assets["snake_texture.tex"];
    this.addModel(snake);

    const snakePhys = ModelCache.newModel("DEBUG_Snake_Phys");
    snakePhys.position = snake.position;
    this.addPhysicsModel(snakePhys);
  }

  draw() {
    _r.color(0, 0.5, 1, 1);
    _r.rect(0, 0, _m.width, _m.height);

    _r.color(1, 1, 1, 1);
    this.drawSkybox(assets["skytexture_blue.tex"]);

    super.draw();
  }
}

WorldManager.registerWorld("world1", World1);