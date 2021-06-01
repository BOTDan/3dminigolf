GameBase.Debug.ShowFPS = true;

const SCENE = new Scene();
SCENE.camera.position.z = -10;

const PHYSICS = new PhysicsWorld();
const BALL = new PhysicsBall();
BALL.position = new Vector(5, 5, 5);
BALL.velocity = new Vector(4, -6, 0);
PHYSICS.ball = BALL;
const plane = new PlaneCollider(
  new Vector(0, 0, 0),
  new Vector(10, 0 , 0),
  new Vector(10, 0, 10),
  new Vector(0, 0, 10),
  true
);
PHYSICS.addCollider(plane);

const cube = Model.Cube();
// cube.scale.x = 0.1;
SCENE.addModel(cube);

const monkey = ModelCache.newModel("DEBUG_Monkey");
monkey.position.x = 3;
monkey.rotation.pitch = 90;
monkey.calcColour = (tri) => {
  const normal = util.findNormal(tri.worldVerts).invert();
  const amount = normal.dot(new Vector(-1, -5, -1).normalize());
  const amountUp = (1 + amount) / 2;
  return [amountUp, amountUp, amountUp, 1];
};
SCENE.addModel(monkey);

for (let i=0; i < 0; i++) {
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
  SCENE.addModel(windmill, blades, bump);
}

// Create an actual course
function flatLighting(tri) {
  const normal = util.findNormal(tri.worldVerts).invert();
  const amount = normal.dot(new Vector(-1, -5, -1).normalize());
  const amountUp = (1 + amount) / 2;
  return [0, 0, amountUp, 1];
};

const start = ModelCache.newModel("MINIGOLF_End");
start.position = new Vector(0, 0, 5);
start.rotation = new Angle(0, 90, 0);
start.calcColour = flatLighting;

const straight1 = ModelCache.newModel("MINIGOLF_Straight");
straight1.position = new Vector(1, 0, 5);
straight1.rotation = new Angle(0, 90, 0);
straight1.calcColour = flatLighting;

const hill = ModelCache.newModel("MINIGOLF_Hill_Round");
hill.position = new Vector(2, 0, 5);
hill.rotation = new Angle(0, 90, 0);
hill.calcColour = flatLighting;

const end = ModelCache.newModel("MINIGOLF_End_Hole");
end.position = new Vector(3, 0, 5);
end.rotation = new Angle(0, -90, 0);
end.calcColour = flatLighting;

const ball = ModelCache.newModel("MINIGOLF_Ball");
ball.position = new Vector(0, 0.1, 5);
ball.calcColour = flatLighting;

SCENE.addModel(start, straight1, hill, end, ball);

GameBase.Console.AddCommand("faces", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  SCENE.drawFaces = (shouldDraw > 0);
}, "(0/1) [DEBUG] If faces of triangles should be drawn.");

GameBase.Console.AddCommand("outline", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  SCENE.drawEdges = (shouldDraw > 0);
}, "(0/1) [DEBUG] If wireframes should be drawn around triangles.");

GameBase.Console.AddCommand("points", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  SCENE.drawVertices = (shouldDraw > 0);
}, "(0/1) [DEBUG] If vertices of triangles should be drawn.");

GameBase.Hooks.Add("Draw", "MINIGOLF_Draw", () => {
  _r.layer = 0;
  SCENE.draw();
  PHYSICS.debugDraw(SCENE);

  // CAMERA.updateMatrix();

  // _r.color(1, 1, 1, 1);
  // _r.rect(0, 0, _m.width, _m.height);

  // let startTime = Date.now();
  // // Extract all the triangles from their models
  // let triangles = [];
  // MODELS.forEach((model) => {
  //   model.update(CAMERA);
  //   triangles.push(...model.triangulate());
  // });
  // GameBase.Debug.AddOverlay(`${Date.now() - startTime}ms Getting Triangles`, [1, 1, 0, 1]);

  // startTime = Date.now();
  // // Get the triangles readt to render
  // triangles.forEach((triangle) => {
  //   triangle.clip(CAMERA);
  //   triangle.toScreen();
  // });
  // GameBase.Debug.AddOverlay(`${Date.now() - startTime}ms Clipping Triangles`, [1, 1, 0, 1]);

  // // Remove unused triangles
  // startTime = Date.now();
  // triangles = triangles.filter((tri) => !tri.culled);
  // GameBase.Debug.AddOverlay(`${Date.now() - startTime}ms Removing Triangles`, [1, 1, 0, 1]);

  // startTime = Date.now();
  // // Do a depth-sort on the triangles to try make render depth accurate
  // triangles.sort((a, b) => b.zMin - a.zMin);
  // GameBase.Debug.AddOverlay(`${Date.now() - startTime}ms Sorting Triangles`, [1, 1, 0, 1]);

  // startTime = Date.now();
  // // Finally, draw the triangles
  // triangles.forEach((triangle) => {
  //   if (drawTriangles) {
  //     triangle.draw();
  //   }
  //   if (drawWireframe) {
  //     triangle.drawWireframe();
  //   }
  //   if (drawVertices) {
  //     triangle.drawVertices();
  //   }
  // });
  // GameBase.Debug.AddOverlay(`${Date.now() - startTime}ms Drawing Triangles`, [1, 1, 0, 1]);
  
  // GameBase.Debug.AddOverlay(`${triangles.length} Triangles`);
});

let lastTime = new Date().getTime();
function drawFPS() {
  const curTime = new Date().getTime();
  const fps = 1/((curTime - lastTime)/1000);
  _r.color(0, 1, 0, 1);
  GameBase.Text.SetFont("Mplus1m Bold");
  GameBase.Text.SetSize(30);
  GameBase.Text.DrawText(0, 100, `${Math.floor(fps)}FPS`);
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
  const CAMERA = SCENE.camera;

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

  SCENE.think();
});

GameBase.Hooks.Add("OnKeyPressed", "", (keycode) => {
  if (GameBase.GetKey(keycode) === "TAB") {
    SCENE.camera.fov = 90;
    SCENE.camera.rotation.roll = 0;
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
      SCENE.camera.rotation.roll -= dx*0.1;
      SCENE.camera.fov += dy*0.1;
    } else {
      SCENE.camera.rotation.pitch -= dy*0.1;
      SCENE.camera.rotation.yaw -= dx*0.1;
    }
  }
});