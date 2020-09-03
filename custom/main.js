// Write your game code here

/*
GameBase.Hooks.Add( "think", "test_think_hook", function( time ) {
	print("time");
});
*/

const VERTS = [];
const steps = 100;
for (let i=0; i<steps; i++) {
    const a = i / steps-1;
    const x = Math.sin(2 * Math.PI * a) * 20;
    const y = Math.cos(2 * Math.PI * a) * 20;
    VERTS.push(new Vector(x, y, 50+i*0));
}

const camPos = new Vector(0, 0, 0);

function gluPerspective(angleOfView, imageAspectRatio, near, far) {
    const scale = Math.tan(angleOfView * 0.5 * Math.PI / 180) * near;
    const r = imageAspectRatio * scale;
    const l = -r;
    const t = scale;
    const b = -t;
    return { t, l, b, r };
}

function glFrustrum(points, near, far) {
    const matrix = new Matrix(4, 4);

    matrix[0][0] = 2 * near / (points.r - points.l);
    matrix[0][1] = 0;
    matrix[0][2] = 0;
    matrix[0][3] = 0;

    matrix[1][0] = 0;
    matrix[1][1] = 2 * near / (points.t - points.b);
    matrix[1][2] = 0;
    matrix[1][3] = 0;

    matrix[2][0] = (points.r + points.l) / (points.r - points.l);
    matrix[2][1] = (points.t + points.b) / (points.t - points.b);
    matrix[2][2] = -(far + near) / (far - near);
    matrix[2][3] = -1;

    matrix[3][0] = 0;
    matrix[3][1] = 0;
    matrix[3][2] = -2 * far * near / (far - near);
    matrix[3][3] = 0;

    return matrix;
}

function drawIt() {
    const imageWidth = _m.width;
    const imageHeight = _m.height;
    //const Mproj = new Matrix();
    const worldToCamera = Matrix.transformationMatrix();
    worldToCamera[3][0] = camPos.x;
    worldToCamera[3][1] = camPos.y;
    worldToCamera[3][2] = camPos.z;

    const angleOfView = 90;
    const near = 0.1;
    const far = 100;
    const imageAspectRatio = imageWidth / imageHeight;

    const points = gluPerspective(angleOfView, imageAspectRatio, near, far);
    const Mproj = glFrustrum(points, near, far);

    for (const id in VERTS) {
        const vert = VERTS[id];
        const vertCamera = vert.multiplyMatrix(worldToCamera);
        const projectedVert = vertCamera.multiplyMatrix(Mproj);
        // This should now be see-able
        const screenX = (projectedVert.x + 1) * 0.5 * imageWidth;
        const screenY = (1 - (projectedVert.y + 1) * 0.5) * imageHeight;
        _r.color(id/VERTS.length, 0, 0, 1);
        _r.sprite(screenX, screenY, 5, 5);
    }
}

GameBase.Hooks.Add( "Draw", "test_think_hook", () => {
    _r.color(1, 1, 1, 1);
    const w = _m.width;
    const h = _m.height;
    _r.sprite(w/2, h/2, w-2, h-2);
    drawIt()
});

GameBase.Hooks.Add( "OnKeyPressed", "test_key_hook", (keycode) => {
    switch (keycode) {
        case 26:
            camPos.y += 10;
            break;
        case 22:
            camPos.y -= 10;
            break;
        case 4:
            camPos.x -= 10;
            break;
        case 7:
            camPos.x += 10;
            break;
    }
});