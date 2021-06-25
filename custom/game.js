// Enable FPS counter
GameBase.Debug.ShowFPS = true;

// Load first world
WorldManager.loadWorld("world1");

/**
 * Main Drawing for the game
 */
GameBase.Hooks.Add("Draw", "MINIGOLF_Draw", () => {
  if (WorldManager.activeWorld) {
    WorldManager.activeWorld.draw();
  }
});

/**
 * Main thinking for the game
 */
GameBase.Hooks.Add("Think", "MINIGOLF_Think", (time, dt) => {
  if (!WorldManager.activeWorld) { return; }

  const world = WorldManager.activeWorld;

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

  const lookDir = world.camera.rotation.getForward();
  const rightDir = world.camera.rotation.getRight();
  const upDir = world.camera.rotation.getUp();

  world.camera.position = world.camera.position.add(lookDir.multiply(forward * speed));
  world.camera.position = world.camera.position.add(rightDir.multiply(right * speed));
  world.camera.position = world.camera.position.add(upDir.multiply(up * speed));
  
  world.think(dt);
  
  if (world.ball.cameraAttached) {
    world.camera.position = world.ball.cameraPosition;
    world.camera.rotation = world.ball.cameraAngle;
  }
});

let mouseDragging = false;
/**
 * Main callback for mouse clicks
 */
GameBase.Hooks.Add("OnMousePressed", "MINIGOLF_OnMousePressed", (x, y, button) => {
  // RMB - Handle camera dragging
  if (button === 1) {
    mouseDragging = true;
  }
  // LMB - Handle hitting the ball if allowed
  if (button === 0) {

  }
});

/**
 * Main callback for releasing mouse clicks
 */
GameBase.Hooks.Add("OnMouseReleased", "MINIGOLF_OnMouseReleased", (x, y, button) => {
  if (button === 1) {
    mouseDragging = false;
  }
});

/**
 * Main callback for when the mouse moves
 */
GameBase.Hooks.Add("OnMouseMoved", "MINIGOLF_OnMouseMoved", (x, y, dx, dy, focused) => {
  // Code for handling camera rotation if player is dragging RMB
  if (mouseDragging && WorldManager.activeWorld) {
    const world = WorldManager.activeWorld;
    const camera = world.camera;
    const ball = world.ball;
    if (GameBase.IsKeyDown("LEFT_ALT")) {
      if (ball.cameraAttached) {
        ball.cameraDistance += dy*0.001;
      } else {
        camera.rotation.roll += dx*0.1;
        camera.fov += dy*0.1;
      }
    } else {
      if (ball.cameraAttached) {
        ball.cameraAngle.pitch += dy*0.1;
        ball.cameraAngle.yaw -= dx*0.1;
      } else {
        camera.rotation.pitch += dy*0.1;
        camera.rotation.yaw -= dx*0.1;
      }
    }
  }
});

/**
 * Main callback for when a key is pressed
 */
GameBase.Hooks.Add("OnKeyPressed", "MINIGOLF_OnKeyPressed", (keycode) => {
  if (!WorldManager.activeWorld) { return; }
  const world = WorldManager.activeWorld;
  switch (GameBase.GetKey(keycode)) {
    case "TAB": {
      world.camera.fov = 90;
      world.camera.rotation.roll = 0;
      break;
    }
    case "KP_PLUS": {
      world.physics.timescale += 0.1;
      break;
    }
    case "KP_MINUS": {
      world.physics.timescale -= 0.1;
      break;
    }
    case "KP_ENTER": {
      world.physics.paused = !world.physics.paused;
      break;
    }
    case "KP_0": {
      world.ball.cameraAttached = !world.ball.cameraAttached;
      if (world.ball.cameraAttached) {
        world.ball.cameraAngle = world.camera.rotation;
      }
      break;
    }
  }
});