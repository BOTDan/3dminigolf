let VERTS = [];
let MODELS = [];
MODELS.push(makeTestModel());

let spiralSteps = 100;
let floorSize = 50;
let floorSteps = 50;

function generateTestVerts() {
    VERTS = [];
    for (let i=0; i<spiralSteps; i++) {
        const a = i / spiralSteps-1;
        const x = Math.sin(2 * Math.PI * a) * 20;
        const y = Math.cos(2 * Math.PI * a) * 20;
        VERTS.push(new Vector(x, y, 50+i*0.5));
    }
    for (let i=0; i<floorSteps; i++) {
        for (let j=0; j<floorSteps; j++) {
            VERTS.push(new Vector(
                -floorSize/2 + floorSize * (i/floorSteps),
                -5,
                -floorSize/2 + floorSize * (j/floorSteps),));
        }
    }
}
generateTestVerts();
GameBase.Console.AddCommand("setspace", (size, steps) => {
    if (size === undefined) {
        GameBase.Console.AttemptCommand("help", "setspace");
        return;
    }
    floorSize = size || floorSize;
    floorSteps = steps || floorSteps;
    generateTestVerts();
    GameBase.Console.Log(`Floor set to ${size}x${size} uits, with ${steps}x${steps} vertices`)
}, "setspace [size] [density] (default 60, 50)");

let camPos = new Vector(0, 0, 0);
let camAngle = new Angle(0, 0, 0);
let camFov = 90;

let dragging = false;
let altDragging = false;

function getPerspective(fov, aspect, near, far) {
    const scale = Math.tan(fov * 0.5 * Math.PI / 180) * near;
    const r = aspect * scale;
    const l = -r;
    const t = scale;
    const b = -t;
    return { top: t, left: l, bottom: b, right: r };
}

function getViewFustrum(points, near, far) {
    const matrix = new Matrix(4, 4);

    matrix[0][0] = 2 * near / (points.right - points.left);
    matrix[0][1] = 0;
    matrix[0][2] = 0;
    matrix[0][3] = 0;

    matrix[1][0] = 0;
    matrix[1][1] = 2 * near / (points.top - points.bottom);
    matrix[1][2] = 0;
    matrix[1][3] = 0;

    matrix[2][0] = (points.right + points.left) / (points.right - points.left);
    matrix[2][1] = (points.top + points.bottom) / (points.top - points.bottom);
    matrix[2][2] = -(far + near) / (far - near);
    matrix[2][3] = -1;

    matrix[3][0] = 0;
    matrix[3][1] = 0;
    matrix[3][2] = -2 * far * near / (far - near);
    matrix[3][3] = 0;

    return matrix;
}

function getViewOrtho(points, near, far) {
    const matrix = new Matrix(4, 4);

    matrix[0][0] = 2 / (points.right - points.left);
    matrix[0][1] = 0;
    matrix[0][2] = 0;
    matrix[0][3] = -(points.right + points.left) / (points.right - points.left);

    matrix[1][0] = 0;
    matrix[1][1] = 2 / (points.top - points.bottom);
    matrix[1][2] = 0;
    matrix[1][3] = -(points.top + points.bottom) / (points.top - points.bottom);

    matrix[2][0] = 0;
    matrix[2][1] = 0;
    matrix[2][2] = -2 / (far - near);
    matrix[2][3] = -(far + near) / (far - near);

    matrix[3][0] = 0;
    matrix[3][1] = 0;
    matrix[3][2] = 0;
    matrix[3][3] = 1;

    return matrix;
}

function drawIt() {
    const imageWidth = _m.width;
    const imageHeight = _m.height;
    const translation = camPos.getTranslationMatrix()
    const rotation = camAngle.getRotationMatrix();
    const worldToCamera = translation.multiply(rotation);

    const angleOfView = camFov;
    const near = 0.1;
    const far = 1000;
    const imageAspectRatio = imageWidth / imageHeight;

    const points = getPerspective(angleOfView, imageAspectRatio, near, far);
    const projection = getViewFustrum(points, near, far);

    for (const id in VERTS) {
        const vert = VERTS[id];
        const vertCamera = vert.multiplyMatrix(worldToCamera);
        const projectedVert = vertCamera.multiplyMatrix(projection);
        if (projectedVert.z > 1) { continue; }
        // This should now be see-able
        const screenX = (projectedVert.x + 1) * 0.5 * imageWidth;
        const screenY = (1 - (projectedVert.y + 1) * 0.5) * imageHeight;
        _r.color(id/VERTS.length, 0, 0, 1);
        _r.sprite(screenX, screenY, 5, 5);
    }

    _r.layer++;
    for (const model of MODELS) {
        model.transform(worldToCamera, projection);
        model.draw(imageWidth, imageHeight);
    }
}

let lastTime = new Date().getTime();
function drawFPS() {
    const curTime = new Date().getTime();
    const fps = 1/((curTime - lastTime)/1000);
    _r.color(0, 1, 0, 1);
    GameBase.Text.SetFont("Mplus1m Bold");
    GameBase.Text.SetSize(30);
    GameBase.Text.DrawText(0, 0, `${Math.floor(fps)}FPS | ${VERTS.length} Vertices`);
    lastTime = curTime;
}

GameBase.Hooks.Add("Draw", "test_think_hook", () => {
    _r.color(1, 1, 1, 1);
    const w = _m.width;
    const h = _m.height;
    _r.sprite(w/2, h/2, w-2, h-2);
    drawIt();
    drawFPS();
});

GameBase.Hooks.Add("Think", "test_key_hook", (keycode) => {
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

    const lookDir = camAngle.getForward();
    const rightDir = camAngle.getRight();
    const upDir = camAngle.getUp();

    camPos = camPos.add(lookDir.multiply(forward * speed));
    camPos = camPos.add(rightDir.multiply(right * speed));
    camPos = camPos.add(upDir.multiply(up * speed));
});

GameBase.Hooks.Add("OnKeyPressed", "", (keycode) => {
    print(GameBase.GetKey(keycode));
    if (GameBase.GetKey(keycode) === "TAB") {
        camFov = 90;
        camAngle.roll = 0;
    }
});

GameBase.Hooks.Add("OnMousePressed", "h", () => {
    dragging = true;
})

GameBase.Hooks.Add("OnMouseReleased", "h", () => {
    dragging = false;
})

GameBase.Hooks.Add("OnMouseMoved", "test_mouse_hook", (x, y, dx, dy, focused) => {
    if (dragging) {
        if (GameBase.IsKeyDown("LEFT_ALT")) {
            camAngle.roll -= dx*0.001;
            camFov += dy*0.1;
        } else {
            camAngle.pitch -= dx*0.002;
            camAngle.yaw -= dy*0.002;
        }
    }
});