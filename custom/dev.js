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
// cube.scale.x = 0.1;
MODELS.push(cube);

const monkeyData = parsePLY(mg_floor_bump);
for (let i=0; i < 5; i++) {
  // const monkey = generateModel(monkeyData);
  const windmill = ModelCache.newModel("MINIGOLF_Windmill");
  windmill.position.x = 5 + i * 1;
  windmill.calcColour = (tri) => {
    const normal = util.findNormal(tri.worldVerts).invert();
    const amount = normal.dot(new Vector(-1, -5, -1).normalize());
    const amountUp = (1 + amount) / 2;
    return [0, amountUp, 0, 1];
  };
  const blades = ModelCache.newModel("MINIGOLF_Windmill_Blades");
  blades.position.x = 5 + i * 1;
  blades.position.y = 0.9;
  blades.position.z = -0.425;
  blades.calcColour = (tri) => {
    const normal = util.findNormal(tri.worldVerts).invert();
    const amount = normal.dot(new Vector(-1, -5, -1).normalize());
    const amountUp = (1 + amount) / 2;
    return [amountUp, 0, 0, 1];
  };
  blades.think = function() {
    // this.rotation.roll += 1;
  }
  const bump = ModelCache.newModel("MINIGOLF_Bump_Walls");
  bump.position = new Vector(5 + i * 1, 0, 1);
  bump.calcColour = (tri) => {
    const normal = util.findNormal(tri.worldVerts).invert();
    const amount = normal.dot(new Vector(-1, -5, -1).normalize());
    const amountUp = (1 + amount) / 2;
    return [0, 0, amountUp, 1];
  };
  MODELS.push(windmill, blades, bump);
}

let drawTriangles = true;
GameBase.Console.AddCommand("faces", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  drawTriangles = (shouldDraw > 0);
}, "(0/1) [DEBUG] If faces of triangles should be drawn.");

let drawWireframe = false;
GameBase.Console.AddCommand("outline", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  drawWireframe = (shouldDraw > 0);
}, "(0/1) [DEBUG] If wireframes should be drawn around triangles.");

let drawVertices = false;
GameBase.Console.AddCommand("points", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  drawVertices = (shouldDraw > 0);
}, "(0/1) [DEBUG] If vertices of triangles should be drawn.");

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
    if (drawVertices) {
      triangle.drawVertices();
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
  let speed = 0.05;

  if (GameBase.IsKeyDown("W")) { forward += 1; };
  if (GameBase.IsKeyDown("S")) { forward -= 1; };
  if (GameBase.IsKeyDown("A")) { right -= 1; };
  if (GameBase.IsKeyDown("D")) { right += 1; };
  if (GameBase.IsKeyDown("SPACEBAR")) { up += 1; }
  if (GameBase.IsKeyDown("LEFT_CONTROL")) { up -= 1; }
  if (GameBase.IsKeyDown("LEFT_SHIFT")) { speed = 0.1; };

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