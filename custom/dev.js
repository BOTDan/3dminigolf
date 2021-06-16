GameBase.Debug.ShowFPS = true;

const SCENE = new Scene();
SCENE.camera.position.z = -10;
SCENE.camera.position.y = -5;

const PHYSICS = new PhysicsWorld();
PHYSICS.paused = true;
const BALL = new PhysicsBall();
BALL.position = new Vector(0, 0.11, 5);
BALL.velocity = new Vector(1.82, 0, 0);
BALL.size = 0.04;
PHYSICS.ball = BALL;
// PHYSICS.addCollider(new PlaneCollider(
//   new Vector(0, -5, 0),
//   new Vector(10, -5 , 0),
//   new Vector(10, 5, 10),
//   new Vector(0, 5, 10),
//   true
// ));
// PHYSICS.addCollider(new PlaneCollider(
//   new Vector(0, 0, 0),
//   new Angle(-90, 0, 0).getForward()
// ));
// PHYSICS.addCollider(new PlaneCollider(
//   new Vector(0, 0, -2),
//   new Angle(-45, 0, 0).getForward()
// ));
// PHYSICS.addCollider(PlaneCollider.Quadrilateral(
//   [new Vector(0, 0, 0),
//   new Vector(5, 0, 0),
//   new Vector(5, 0, 5),
//   new Vector(0, 0, 5)],
//   true
// ));
// PHYSICS.addCollider(PlaneCollider.Quadrilateral(
//   [new Vector(0, 0, 0),
//   new Vector(5, 0, 0),
//   new Vector(5, 0.05, -0.2),
//   new Vector(0, 0.05, -0.2)],
//   false
// ));
// PHYSICS.addCollider(PlaneCollider.Quadrilateral(
//   [new Vector(0, 0.05, -0.2),
//   new Vector(5, 0.05, -0.2),
//   new Vector(5, 0.3, -2),
//   new Vector(0, 0.3, -2)],
//   false
// ));

const steps = 10;
const radius = 3;
const width = 5;
const points = [];
for (let i=0; i <= steps; i++) {
  const angle = util.toRadians((i/steps) * 360 + 180);
  const z = Math.sin(angle) * radius;
  const y = Math.cos(angle) * radius;
  points.push(new Vector((i/steps) * width, y, z));
}
for (let i=0; i < points.length-1; i++) {
  PHYSICS.addCollider(PlaneCollider.Quadrilateral(
    [points[i],
    points[i].add(new Vector(width, 0, 0)),
    points[i+1].add(new Vector(width, 0, 0)),
    points[i+1]],
    false
  ));
}
PHYSICS.addCollider(PlaneCollider.Quadrilateral(
  [new Vector(0, -radius, 0),
  new Vector(width, -radius, 0),
  new Vector(width, -radius, 10),
  new Vector(0, -radius, 10)],
  true
));
PHYSICS.addCollider(PlaneCollider.Quadrilateral(
  [new Vector(width, -radius, 0),
  new Vector(width*2, -radius, 0),
  new Vector(width*2, -radius, -10),
  new Vector(width, -radius, -10)],
  false
));
// End Plates
PHYSICS.addCollider(PlaneCollider.Quadrilateral(
  [new Vector(width, -radius, -10),
  new Vector(width*2, -radius, -10),
  new Vector(width*2, -radius+2, -10),
  new Vector(width, -radius+2, -10)],
  false
));
PHYSICS.addCollider(PlaneCollider.Quadrilateral(
  [new Vector(width, -radius, 10),
  new Vector(0, -radius, 10),
  new Vector(0, -radius+2, 10),
  new Vector(width, -radius+2, 10)],
  false
));
// Side Plates
PHYSICS.addCollider(PlaneCollider.Quadrilateral(
  [new Vector(width*2, -radius, -10),
  new Vector(width*2, -radius+2, -10),
  new Vector(width*2, -radius+2, 0),
  new Vector(width*2, -radius, 0)],
  true
));
PHYSICS.addCollider(PlaneCollider.Quadrilateral(
  [new Vector(0, -radius, 10),
  new Vector(0, -radius+2, 10),
  new Vector(0, -radius+2, 0),
  new Vector(0, -radius, 0)],
  true
));
// PHYSICS.addCollider(PlaneCollider.Quadrilateral(
//   new Vector(0, 0.3, -0.5),
//   new Vector(5, 0.3, -0.5),
//   new Vector(5, 0.3, -1.5),
//   new Vector(0, 0.3, -1.5),
//   false
// ));
// PHYSICS.addCollider(new PlaneCollider(
//   new Vector(0, -5, 0),
//   new Vector(10, -5, 0),
//   new Vector(10, 5, 0),
//   new Vector(0, 5, 0),
//   false
// ));

const test = new Matrix(4, 4);
test[0][0] = 1;
test[0][1] = 2;
test[0][2] = 3;
test[0][3] = -4;
test[1][0] = 2;
test[1][1] = 1;
test[1][2] = 2;
test[1][3] = 3;
test[2][0] = 3;
test[2][1] = 2;
test[2][2] = 1;
test[2][3] = 2;
test[3][0] = 4;
test[3][1] = 3;
test[3][2] = 2;
test[3][3] = 1;

print(test.invert());

// const origin = new Vector(1, 2, 3);
// const point = new Vector(1, 2, 6);
// const angle = new Angle(0, 0, 0);
// print(util.worldToLocal(point, angle, origin, angle));

const ang = new Angle(-95, -45, 0).getForward();
print(ang);
print(ang.asAngle());

const BALL_MODEL = ModelCache.newModel("DEBUG_Sphere");
BALL_MODEL.scale = new Vector(BALL.size, BALL.size, BALL.size);
BALL_MODEL.calcColour = Model.flatLighting;
SCENE.addModel(BALL_MODEL);

const cube = Model.Cube();
// cube.scale.x = 0.1;
cube.position.z = -10;
SCENE.addModel(cube);

const monkey = ModelCache.newModel("DEBUG_Monkey");
monkey.position.x = 3;
monkey.position.z = -10;
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

// const ball = ModelCache.newModel("MINIGOLF_Ball");
// ball.position = new Vector(0, 0.1, 5);
// ball.calcColour = flatLighting;

SCENE.addModel(start, straight1, hill, end);

physicsFromModel(start, PHYSICS);
physicsFromModel(straight1, PHYSICS);
physicsFromModel(hill, PHYSICS);
physicsFromModel(end, PHYSICS);

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

let physDebugDraw = false;
GameBase.Console.AddCommand("physoutline", (bool) => {
  if (isNaN(bool)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be 0/1` ] );
  }
  const shouldDraw = parseInt(bool);
  physDebugDraw = (shouldDraw > 0);
}, "(0/1) [DEBUG] If the physics system should render colliders.");

GameBase.Console.AddCommand("phystimescale", (number) => {
  if (isNaN(number)) {
    GameBase.Console.Log( [ CONSOLE_RED, `Argument must be a number` ] );
  }
  PHYSICS.timescale = number;
}, "(0/1) [DEBUG] Sets the physics timescale (default 1)");

GameBase.Hooks.Add("Draw", "MINIGOLF_Draw", () => {
  _r.layer = 0;
  SCENE.draw();
  if (physDebugDraw) {
    PHYSICS.debugDraw(SCENE);
  }

  // _r.color(1, 1, 0, 0.5);
  // const start = new Vector(0, 0, 0);
  // const normal = new Angle(-45, 45, 0);
  // const sameNormal = new Vector(1, 1, 1).normalize();
  // print(normal.getForward());
  // print(sameNormal);
  // // print(normal);
  // // print(sameNormal.asAngle());
  // _r.color(1, 1, 1, 1);
  // SCENE.drawPoint(start, 10);
  // SCENE.drawLine(start, start.add(normal.getForward().multiply(2)));
  // _r.color(1, 0, 0, 1);
  // SCENE.drawLine(start, start.add(sameNormal.asAngle().getForward()));

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

GameBase.Hooks.Add("Think", "test_key_hook", (time, dt) => {
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

  PHYSICS.think(dt);
  SCENE.think();
  BALL_MODEL.position = BALL.position;
});

GameBase.Hooks.Add("OnKeyPressed", "", (keycode) => {
  switch (GameBase.GetKey(keycode)) {
    case "TAB": {
      SCENE.camera.fov = 90;
      SCENE.camera.rotation.roll = 0;
      break;
    }
    case "KP_PLUS": {
      PHYSICS.timescale += 0.1;
      break;
    }
    case "KP_MINUS": {
      PHYSICS.timescale -= 0.1;
      break;
    }
    case "KP_ENTER": {
      PHYSICS.paused = !PHYSICS.paused;
      break;
    }
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