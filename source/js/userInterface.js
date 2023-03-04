// userInterface.js
// This file defines a canvas for displayin
// a custom mouse cursor, its trace, and
// things that drawn by a user.

// Declarations
const $uiCanvas = document.createElement('canvas');
const $programStateText = document.createElement('p');
const uiCCTX2d = $uiCanvas.getContext('2d');
const cursorCoords = {
    x: -50,
    y: -50
};
const cursorTrace = new CursorTraceList(100);

/**
 * This function will be called at renderer.js.
 * It performs initializations related with
 * the canvas for user interface.
 */
async function userInterfaceInit() {
    return new Promise((resolve) => {
        $uiCanvas.width = screenSize.cx;
        $uiCanvas.height = screenSize.cy;
        $programStateText.id = 'program-state-text';
        document.body.appendChild($uiCanvas);
        document.body.appendChild($programStateText);
        
        // Update cursor position
        window.electronAPI.onMouseMove((event, { x, y }) => {
            cursorCoords.x = x;
            cursorCoords.y = y;
            cursorTrace.insertBeforeFirst(new CursorTraceElement(x, y));
        });

        // Update `$programStateText`
        window.electronAPI.onWindowTitle((event, data) => {
            if (currentMode === 0) updateProgramStateText(`Typing mode::${data}`);
        });

        // Draw start
        clearUI();
        drawCursorTrace();
        drawCursor();
        window.electronAPI.onMouseClick(() => {
            drawClickEffect();
            actx.playSoundEffect('click');
        });

        resolve();
    });
}

/**
 * This function updates `$programStateText` with
 * the `txt` parameter passed.
 * @param {string} txt a text to put.
 */
function updateProgramStateText(txt) {
    $programStateText.textContent = 'Webcam Overlay::' + txt;
}

/**
 * This function erases the whole blackboard
 * on every `requestAnimationFrame()`.
 */
function clearUI() {
    uiCCTX2d.clearRect(0, 0, $uiCanvas.width, $uiCanvas.height);
    window.requestAnimationFrame(clearUI);
}

/**
 * This function returns a color depending on
 * the `mode` parameter passed.
 * @param {number} mode 1 for red, 2 for blue, 3 for gold.
 * @param {number} alpha from 0 (transparent) to 1 (actual color).
 */
function getColor(mode, alpha) {
    // Return the corresponding color.
    if (mode === 1) {
        return `rgb(237, 58, 10, ${alpha})`;
    }
    else if (mode === 2) {
        return `rgb(4, 105, 237, ${alpha})`;
    }
    else if (mode === 3) {
        return `rgb(255, 215, 0, ${alpha})`;
    }
}

/**
 * This function is used to get a smooth motion.
 * What it calculates is a log function, which
 * means a position with respect to a given time.
 * @param {number} t a value on a time axis.
 * @param {number} total a total time that a motion spends while it starts and finishes.
 * @param {number} distance a distance that this motion makes.
 */
function ease(t, total, distance) {
    // We need a value which log_base(t) = distance,
    // where t = total + 1.
    const BASE = total ** (1 / distance);
    
    // a value of a log function, where
    // base = BASE,
    // anti-logarithm = t + 1.
    // * About this formula, refer to properties of logarithm (change of base).
    return Math.log2(t + 1) / Math.log2(BASE);
}

// Functions used to draw lines
// which make a cursor together.
const cursorLineFn = {
    1: {
        x: (t) => 12 - t,
        y: (x) => (8 * x) / 3
    },
    2: {
        x: (t) => 12 + t,
        y: (x) => (-4 * x) + 80
    },
    3: {
        x: (t) => 32 - t,
        y: (x) => (-x / 4) + 20
    },
    4: {
        x: (t) => 32 - t,
        y: (x) => (3 * x) / 8
    }
};

/**
 * This function draws one of the lines forming the mouse cursor together.
 * @param {number} num a number of the line to draw.
 * @param {number} mode 1 for red, 2 for blue.
 * @param {number} t a value on a time axis.
 * @param {number} alpha from 0 (transparent) to 1 (actual color).
 */
function drawCursorLine(num, mode, t, alpha) {
    const xt = cursorLineFn[num].x;
    const yx = cursorLineFn[num].y;
    const xt0 = xt(0);
    const xtt = xt(t);

    uiCCTX2d.strokeStyle = getColor(mode, alpha);
    uiCCTX2d.beginPath();
    uiCCTX2d.moveTo(xt0 + cursorCoords.x, yx(xt0) + cursorCoords.y);
    uiCCTX2d.lineTo(xtt + cursorCoords.x, yx(xtt) + cursorCoords.y);
    uiCCTX2d.stroke();
}

/**
 * This function draws a mouse cursor.
 * This function will be pushed into
 * `blackboardDrawingList` by `drawBlackboard()`.
 */
function drawCursor() {
    const cursorAnimationFirstPhaseTotalTick = 59;
    const cursorAnimationSecondPhaseTotalTick = 59;
    let cursorAnimationTick = 0;
    let cursorAnimationPhase = 1;

    function _drawCursor() {
        uiCCTX2d.lineWidth = 2;

        switch (cursorAnimationPhase) {
            case 1: {
                drawCursorLine(1, 1, ease(cursorAnimationTick, cursorAnimationFirstPhaseTotalTick + 1, 12), 1);
                drawCursorLine(2, 1, ease(cursorAnimationTick, cursorAnimationFirstPhaseTotalTick + 1, 4), 1);
                drawCursorLine(3, 2, ease(cursorAnimationTick, cursorAnimationFirstPhaseTotalTick + 1, 16), 1);
                drawCursorLine(4, 2, ease(cursorAnimationTick, cursorAnimationFirstPhaseTotalTick + 1, 32), 1);
            }
            break;
    
            case 2: {
                const alpha = 1 - (cursorAnimationTick / cursorAnimationSecondPhaseTotalTick);
    
                drawCursorLine(1, 1, 12, alpha);
                drawCursorLine(2, 1, 4, alpha);
                drawCursorLine(3, 2, 16, alpha);
                drawCursorLine(4, 2, 32, alpha);
            }
            break;
        }
    
        if (cursorAnimationTick === cursorAnimationFirstPhaseTotalTick && cursorAnimationPhase === 1) {
            cursorAnimationPhase = 2;
            cursorAnimationTick = 0;
        }
        else if (cursorAnimationTick === cursorAnimationSecondPhaseTotalTick && cursorAnimationPhase === 2) {
            cursorAnimationPhase = 1;
            cursorAnimationTick = 0;
        }
        else cursorAnimationTick++;
    
        window.requestAnimationFrame(_drawCursor);
    }

    return _drawCursor();
}

/**
 * This function calculates a positive integer
 * between min and max (max is inclusive).
 * @param {number} min minimum value
 * @param {number} max maximum value
 */
function randPInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const RAD = Math.PI / 180; // From degree to radian.
const innerRadiusRatio = 0.6; // outer : inner = 1 : 0.6

/**
 * This function is used in `drawClickEffect()`.
 * It calculates points which make a star all together.
 * @param {number} radius radius.
 * @param {number} _angle angle.
 * @param {number} theta an additional angle to be added to the `_angle` parameter.
 */
function starPoint(radius, _angle, theta) {
    const angle = _angle + theta;

    return {
        x: radius * Math.sin(angle * RAD),
        y: -radius * Math.cos(angle * RAD)
    }
}

/**
 * This function draws a rotating star
 * which disappears in fast.
 * It is called in `drawClickEffect()`.
 * @param {number} size a size of this star.
 * @param {number} direction an angle which this start moves to.
 * @param {number} color a color of this star.
 * @param {number} cx mouse cursor X.
 * @param {number} cy mouse cursor Y.
 * @param {number} tick current animation progress.
 * @param {number} totalTick How long does this animation take to finish?
 * @param {number} starMoveDistance How long does this star move?
 */
function drawStar(size, direction, color, angle, cx, cy, tick, totalTick, starMoveDistance) {
    let radius = size;
    const op = [
        starPoint(radius, angle, 0),
        starPoint(radius, angle, 72),
        starPoint(radius, angle, 144),
        starPoint(radius, angle, 216),
        starPoint(radius, angle, 288)
    ];
    radius = size * innerRadiusRatio;
    const ip = [
        starPoint(radius, angle, 180),
        starPoint(radius, angle, 252),
        starPoint(radius, angle, 324),
        starPoint(radius, angle, 396),
        starPoint(radius, angle, 468)
    ];

    const displacement = ease(tick, totalTick + 1, starMoveDistance);

    uiCCTX2d.translate(cx, cy);
    uiCCTX2d.rotate(direction);
    uiCCTX2d.lineWidth = 2;
    uiCCTX2d.strokeStyle = color;
    uiCCTX2d.fillStyle = color;
    uiCCTX2d.beginPath();
    uiCCTX2d.moveTo(op[0].x + displacement, op[0].y);
    uiCCTX2d.lineTo(ip[3].x + displacement, ip[3].y);
    uiCCTX2d.lineTo(op[1].x + displacement, op[1].y);
    uiCCTX2d.lineTo(ip[4].x + displacement, ip[4].y);
    uiCCTX2d.lineTo(op[2].x + displacement, op[2].y);
    uiCCTX2d.lineTo(ip[0].x + displacement, ip[0].y);
    uiCCTX2d.lineTo(op[3].x + displacement, op[3].y);
    uiCCTX2d.lineTo(ip[1].x + displacement, ip[1].y);
    uiCCTX2d.lineTo(op[4].x + displacement, op[4].y);
    uiCCTX2d.lineTo(ip[2].x + displacement, ip[2].y);
    uiCCTX2d.closePath();
    uiCCTX2d.stroke();
    uiCCTX2d.setTransform(1, 0, 0, 1, 0, 0);
    uiCCTX2d.fill();
}

/**
 * This function is for initializing an array
 * which is to have particle data.
 * @param {number} num the number of particles.
 */
function _initParticleData(num) {
    const arr = [];
    for (let i = 0; i < num; i++) {
        const size = randPInt(8, 10);
        const direction = randPInt(0, 359) * RAD;
        const color = randPInt(1, 2);
        const angle = randPInt(0, 359);
        const currentCursorX = cursorCoords.x;
        const currentCursorY = cursorCoords.y;

        arr[i] = { size, direction, color, angle, currentCursorX, currentCursorY };
    }
    return arr;
}

const TOTAL_SIZE_TO_BE_DECREASED = 5;
const TOTAL_ANGULAR_VELOCITY_TO_BE_DECREASED = 36;

/**
 * This function draws a click effect.
 * This function will be pushed into
 * `blackboardDrawingList` by `window.electronAPI.onMouseClick(callback)`.
 * @param {object} _particleData data of particles.
 */
function drawClickEffect(_particleData = null) {
    const TOTAL_TICK = 29;
    const STAR_MOVE_DISTANCE = 50;
    let particleData;
    let tick = 0;

    // If the _particleData parameter is not
    // given, use default setting.
    if (_particleData === null) {
        const particleNum = randPInt(3, 4);
        particleData = _initParticleData(particleNum);
    }
    else {
        particleData = _particleData;
    }

    function drawStars() {
        for (let i = 0; i < particleData.length; i++) {
            const ref = particleData[i];
            const SIZE_DECREMENT = TOTAL_SIZE_TO_BE_DECREASED / TOTAL_TICK;
            const ALPHA_DECREMENT = 1 / TOTAL_TICK;
            const ANGULAR_VELOCITY = TOTAL_ANGULAR_VELOCITY_TO_BE_DECREASED / TOTAL_TICK;
            const size = ref.size - SIZE_DECREMENT * tick;
            const color = getColor(ref.color, 1 - ALPHA_DECREMENT * tick);
            const angle = ref.angle + ANGULAR_VELOCITY * tick;
    
            drawStar(size, ref.direction, color, angle, ref.currentCursorX, ref.currentCursorY, tick, TOTAL_TICK, STAR_MOVE_DISTANCE);
        }

        // Exit condition
        if (tick !== TOTAL_TICK) {
            window.requestAnimationFrame(drawStars);
            tick++;
        }
    }

    return drawStars();
}

/**
 * This function draws a cursor trace.
 */
function drawCursorTrace() {
    const DELETE_AMOUNT = 7;
    
    function _drawCursorTrace() {
        if (cursorTrace.length > 0) {
            uiCCTX2d.lineWidth = 2;
            uiCCTX2d.strokeStyle = 'rgb(255, 215, 0, 0.7)';
            uiCCTX2d.beginPath();
            uiCCTX2d.moveTo(cursorTrace.firstElement.x, cursorTrace.firstElement.y);
            let pointer = cursorTrace.firstElement;
            while (pointer !== null) {
                uiCCTX2d.lineTo(pointer.x, pointer.y);
                pointer = pointer.next;
            }
            uiCCTX2d.stroke();

            const deleteAmount = Math.min(cursorTrace.length, DELETE_AMOUNT);
            for (let idx = 0; idx < deleteAmount; idx++) {
                cursorTrace.deleteLast();
            }
        }
        window.requestAnimationFrame(_drawCursorTrace);
    }

    return _drawCursorTrace();
}