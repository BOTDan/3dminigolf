const CAMERA = new Camera(new Vector(0, 0, -10));
const MODELS = [];

// const testPoly1 = new Polygon([
//   new Vector(0, 0, 0),
//   new Vector(10, 0, 0),
//   new Vector(10, 10, 0),
//   new Vector(0, 10, 0)
// ]);
// testPoly1.flipNormal = true;

const cube = Model.Cube();
MODELS.push(cube);

const monkeyData = parsePLY(testData);
for (let i=0; i < 5; i++) {
  const monkey = generateModel(monkeyData);
  monkey.rotation.pitch = 90;
  monkey.position.x = 5 + i * 3;
  monkey.calcColour = (tri) => {
    const normal = util.findNormal(tri.worldVerts);
    const amountUp = (1 + normal.y) / 2;
    return [0, amountUp, 0, 1];
  };
  MODELS.push(monkey);
}

let drawWireframe = false;
GameBase.Console.AddCommand("outline", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  drawWireframe = (shouldDraw > 0);
}, "test");

GameBase.Hooks.Add("Draw", "MINIGOLF_Draw", () => {
  CAMERA.updateMatrix();

  _r.color(1, 1, 1, 1);
  _r.rect(0, 0, _m.width, _m.height);

  // Extract all the triangles from their models
  const triangles = [];
  MODELS.forEach((model) => {
    model.update(CAMERA);
    triangles.push(...model.triangulate());
  });
  // Get the triangles readt to render
  triangles.forEach((triangle) => {
    triangle.clip(CAMERA);
    triangle.toScreen();
  });
  // Do a depth-sort on the triangles to try make render depth accurate
  triangles.sort((a, b) => b.zMin - a.zMin);
  // Finally, draw the triangles
  triangles.forEach((triangle) => {
    triangle.draw();
    if (drawWireframe) {
      triangle.drawWireframe();
    }
  });
  
  drawFPS();
  drawTriangleCount(triangles.length);
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

function drawTriangleCount(count) {
  _r.color(0, 1, 0, 1);
  GameBase.Text.SetFont("Mplus1m Bold");
  GameBase.Text.SetSize(30);
  GameBase.Text.DrawText(0, 30, `${count} Triangles`);
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