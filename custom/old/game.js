const CAMERA = new Camera(new Vector(0, 0, -10));
const POLYGONS = [];
const MODELS = [];

const testPoly1 = new Polygon([
  new Vector(0, 0, 0),
  new Vector(10, 0, 0),
  new Vector(10, 10, 0),
  new Vector(0, 10, 0)
]);
testPoly1.flipNormal = true;

const testModel1 = new Model();
testModel1.think = function() {
  // this.rotation.pitch += 0.01;
}
MODELS.push(testModel1);
const cube = Model.Cube();
MODELS.push(cube);
const parsed = parsePLY(testData2);
for (let i=0; i < 2; i++) {
  const per = (2*Math.PI) * (i/9);
  const x = Math.sin(per);
  const y = Math.cos(per);
  const monkey = generateModel(parsed);
  monkey.scale = new Vector(1, 1, 1);
  monkey.rotation.yaw = -per;
  // monkey.rotation.yaw = (2*Math.PI)*(i/9);
  monkey.think = function() {
    // const x = Math.sin(per + GameBase.GetTime());
    // const y = Math.cos(per + GameBase.GetTime());
    // this.position.x = 10*x;
    // this.position.z = 10*y;
    // this.rotation.yaw += 0.01;
  }
  monkey.position.z = y*10;
  monkey.position.x = 0 + x*10;
  MODELS.push(monkey);
}

let lastTime = new Date().getTime();
function drawFPS() {
    const curTime = new Date().getTime();
    const fps = 1/((curTime - lastTime)/1000);
    _r.color(0, 1, 0, 1);
    GameBase.Text.SetFont("Mplus1m Bold");
    GameBase.Text.SetSize(30);
    GameBase.Text.DrawText(0, 0, `${Math.floor(fps)}FPS`);
    lastTime = curTime;
}

GameBase.Hooks.Add("Draw", "MINIGOLF_Draw", () => {
  CAMERA.updateMatrix();
  for (const polygon of POLYGONS) {
    polygon.transform(CAMERA.matrix);
    polygon.clip(CAMERA);
    polygon.screen();
    polygon.draw();
  }
  const polygons = [];
  MODELS.forEach((model) => {
    model.transformPolygons(CAMERA.matrix);
    polygons.push(...model.polygons);
  });
  print(polygons.length);
  polygons.forEach((polygon) => {
    polygon.clip(CAMERA);
    polygon.screen();
  })
  polygons.sort((a, b) => b.zMin - a.zMin);
  _r.layer = 0;
  for (const polygon of polygons) {
    polygon.draw();
    _r.layer++;
    // polygon.drawWireframe();
    _r.layer++;
    // polygon.drawVertexNumbers();
    _r.layer++;
  }

  drawFPS();
});

GameBase.Hooks.Add("Think", "test_key_hook", () => {
  let forward = 0;
  let right = 0;
  let up = 0;
  let speed = 0.1;

  if (GameBase.IsKeyDown("W")) { forward += 1; };
  if (GameBase.IsKeyDown("S")) { forward -= 1; };
  if (GameBase.IsKeyDown("A")) { right -= 1; };
  if (GameBase.IsKeyDown("D")) { right += 1; };
  if (GameBase.IsKeyDown("SPACEBAR")) { up += 1; }
  if (GameBase.IsKeyDown("LEFT_CONTROL")) { up -= 1; }
  if (GameBase.IsKeyDown("LEFT_SHIFT")) { speed = 0.5; };

  const lookDir = CAMERA.rotation.getForward();
  const rightDir = CAMERA.rotation.getRight();
  const upDir = CAMERA.rotation.getUp();

  CAMERA.position = CAMERA.position.add(lookDir.multiply(forward * speed));
  CAMERA.position = CAMERA.position.add(rightDir.multiply(right * speed));
  CAMERA.position = CAMERA.position.add(upDir.multiply(up * speed));

  MODELS.forEach(model => model.think());
});

GameBase.Hooks.Add("OnKeyPressed", "", (keycode) => {
  if (GameBase.GetKey(keycode) === "TAB") {
    CAMERA.fov = 90;
    CAMERA.rotation.roll = 0;
  }
});

let dragging = false;
GameBase.Hooks.Add("OnMousePressed", "h", () => {
  dragging = true;
})

GameBase.Hooks.Add("OnMouseReleased", "h", () => {
  dragging = false;
})

GameBase.Hooks.Add("OnMouseMoved", "test_mouse_hook", (x, y, dx, dy, focused) => {
  if (dragging) {
    if (GameBase.IsKeyDown("LEFT_ALT")) {
      CAMERA.rotation.roll -= dx*0.001;
      CAMERA.fov += dy*0.1;
    } else {
      CAMERA.rotation.pitch -= dy*0.002;
      CAMERA.rotation.yaw -= dx*0.002;
    }
  }
});