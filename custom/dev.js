const CAMERA = new Camera(new Vector(0, 0, -10));
const POLYGONS = [];
const MODELS = [];

// const testPoly1 = new Polygon([
//   new Vector(0, 0, 0),
//   new Vector(10, 0, 0),
//   new Vector(10, 10, 0),
//   new Vector(0, 10, 0)
// ]);
// testPoly1.flipNormal = true;

const cube = Model2.Cube();
const monkeyData = parsePLY(testData);
const monkey = generateModel(monkeyData);
monkey.rotation.pitch = 90;
monkey.position.x = 10;
monkey.calcColour = (tri) => {
  const normal = util.findNormal(tri.worldVerts);
  const amountUp = (1 + normal.y) / 2;
  return [0, amountUp, 0, 1];
};


GameBase.Hooks.Add("Draw", "MINIGOLF_Draw", () => {
  CAMERA.updateMatrix();
  
  // Get a list of every triangle
  cube.update(CAMERA);
  const tris = cube.triangulate();
  tris.forEach((tri) => {
    tri.clip(CAMERA);
    tri.toScreen();
    tri.draw();
  });

  monkey.update(CAMERA);
  const tris2 = monkey.triangulate();
  tris2.forEach((tri) => {
    tri.clip(CAMERA);
    tri.toScreen();
    tri.draw();
    tri.drawWireframe();
  });
  
  drawFPS();
});

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
      CAMERA.rotation.roll -= dx*0.1;
      CAMERA.fov += dy*0.1;
    } else {
      CAMERA.rotation.pitch -= dy*0.1;
      CAMERA.rotation.yaw -= dx*0.1;
    }
  }
});