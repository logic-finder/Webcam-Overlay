// blackboard.js
// This file handles what will be drawn
// on the full-screen-sized canvas.

// Declaration & definition
const $blackboard = document.createElement('canvas');
const blackboardCCTX2d = $blackboard.getContext('2d', { willReadFrequently: true });
const MAX_DRAW_HISTORY_SAVE = 11;
const drawHistory = new Array(MAX_DRAW_HISTORY_SAVE); // ImageBitmap<>
const NO_KEY_PRESSED    = 0b0000; // bitmask
const KEY_CTRL_ON_PRESS = 0b0001;
const KEY_Z_ON_PRESS    = 0b0010;
const KEY_Y_ON_PRESS    = 0b0100;
const KEY_ALT_ON_PRESS  = 0b1000;
const $palette = document.createElement('paint-palette');
let prevCursorCoords = null;
let drawHistoryWriterIdx = 0;
let drawHistoryReaderIdx = 0;
let keyCombination = NO_KEY_PRESSED;
let isPresent = true;
let _blackboardEventHandlers;

/**
 * This function will be called at renderer.js.
 * It performs initializations related with
 * the canvas having a role of blackboard.
 */
async function blackboardInit() {
    return new Promise((resolve) => {
        // Canvas init.
        $blackboard.width = screenSize.cx;
        $blackboard.height = screenSize.cy;
        document.body.appendChild($blackboard);

        initPalette();
        initDrawHistory();
        updateDrawHistory(); // Record empty state.
        initKeyCombination();
        _blackboardEventHandlers = handleDrawingOnBlackboard();

        resolve();
    });
}

/**
 * This function initializes `$palette`.
 */
function initPalette() {
    $blackboard.after($palette);
    // Simulating visibility: hidden; by placing the palette
    // to where is outside of the visible window.
    //$palette.style.left = '-155px';
    $palette.style.visibility = 'hidden';
}

/**
 * This function adds two keyboard event listeners
 * that are going to handle the current key press state.
 * Bitwise OR operation adds the pre-defined number,
 * e.g. CTRL + Y = 1 + 4 = 5 = 0b1 | 0b100
 * Bitwise XOR operation subtracts the pre-defined number,
 * e.g. (CTRL + Z) - Z = 3 - 2 = 1 = 0b11 ^ 0b10
 */
function initKeyCombination() {
    window.addEventListener('keydown', (event) => {
        // Update keyCombination after keydown event.
        switch (event.key) {
            case 'Control': keyCombination |= KEY_CTRL_ON_PRESS;
            break;

            case 'z':       keyCombination |= KEY_Z_ON_PRESS;
            break;

            case 'y':       keyCombination |= KEY_Y_ON_PRESS;
            break;

            case 'Alt':     keyCombination |= KEY_ALT_ON_PRESS;
            break;
        }

        // Call specific functions matched to the keyCombination.
        switch (keyCombination) {
            case KEY_CTRL_ON_PRESS | KEY_Z_ON_PRESS:
                returnToPrevCanvasState();
                break;
            
            case KEY_CTRL_ON_PRESS | KEY_Y_ON_PRESS:
                gotoNextCanvasState();
                break;
        }
    });
    window.addEventListener('keyup', (event) => {
        // Update keyCombination after keyup event.
        switch (event.key) {
            case 'Control': keyCombination ^= KEY_CTRL_ON_PRESS;
            break;

            case 'z':       keyCombination ^= KEY_Z_ON_PRESS;
            break;

            case 'y':       keyCombination ^= KEY_Y_ON_PRESS;
            break;

            case 'Alt':     keyCombination ^= KEY_ALT_ON_PRESS;
            break;
        }
    });
}

/**
 * This function initializes `drawHistory` variable.
 */
function initDrawHistory() {
    for (let i = 0; i < drawHistory.length; i++) {
        drawHistory[i] = null;
    }
}

/**
 * This function updates the `drawHistory` array
 * and two counting variables.
 */
function updateDrawHistory() {
    const condition = drawHistoryWriterIdx === MAX_DRAW_HISTORY_SAVE;
    if (condition) {
        for (let i = 1; i < MAX_DRAW_HISTORY_SAVE; i++) {
            drawHistory[i - 1] = drawHistory[i];
        }
        drawHistory[MAX_DRAW_HISTORY_SAVE - 1] = blackboardCCTX2d.getImageData(0, 0, $blackboard.width, $blackboard.height);
    }
    // condition: drawHistoryWriterIdx < MAX_DRAW_HISTORY_SAVE
    else {
        drawHistory[drawHistoryWriterIdx] = blackboardCCTX2d.getImageData(0, 0, $blackboard.width, $blackboard.height);
        
        if (!isPresent) {
            for (let i = drawHistoryWriterIdx + 1; i < MAX_DRAW_HISTORY_SAVE; i++) {
                drawHistory[i] = null;
            }
            isPresent = true;
        }

        drawHistoryReaderIdx = drawHistoryWriterIdx;
        drawHistoryWriterIdx++;
    }
}

/**
 * A function for undo.
 */
function returnToPrevCanvasState() {
    if (drawHistoryReaderIdx === 0) {
        actx.playSoundEffect('fail');
    }
    else {
        isPresent = false;
        drawHistoryReaderIdx--;
        drawHistoryWriterIdx--;
        blackboardCCTX2d.clearRect(0, 0, $blackboard.width, $blackboard.height);
        blackboardCCTX2d.putImageData(drawHistory[drawHistoryReaderIdx], 0, 0);
    }
}

/**
 * A function for redo.
 */
function gotoNextCanvasState() {
    const condition = drawHistoryReaderIdx === MAX_DRAW_HISTORY_SAVE - 1 || drawHistory[drawHistoryReaderIdx + 1] === null;
    if (condition) {
        actx.playSoundEffect('fail');
    }
    else {
        drawHistoryReaderIdx++;
        drawHistoryWriterIdx++;
        blackboardCCTX2d.clearRect(0, 0, $blackboard.width, $blackboard.height);
        blackboardCCTX2d.putImageData(drawHistory[drawHistoryReaderIdx], 0, 0);

        if (condition) {
            isPresent = true;
        }
    }
}

/**
 * This function is called when a user presses
 * the Escape key. It erases the entire blackboard
 * and update its history.
 */
function eraseBlackboard() {
    if (currentMode === 1) {
        blackboardCCTX2d.clearRect(0, 0, $blackboard.width, $blackboard.height);
        updateDrawHistory();
        actx.playSoundEffect('success');
    }
    else {
        actx.playSoundEffect('fail');
    }
    
}

/**
 * This function records a previous cursor coordinates.
 */
function updatePrevCursorCoords() {
    prevCursorCoords = {
        x: cursorCoords.x,
        y: cursorCoords.y
    };
}

/**
 * This function either draws a line during mouse down
 * or shows the palette in order for the user to change
 * the drawing setting, e.g. line width.
 * @return {object} mousedown handler, wheel handler
 */
function handleDrawingOnBlackboard() {
    const COLOR_BRUSH = 0;
    const TRPRT_BRUSH = 1; // transparent brush, or eraser.
    const MIN_LINE_WIDTH = 1;
    const MAX_LINE_WIDTH = 5;
    let isMoved = false;
    let isPaletteShowed = false;
    let lineColor = 'black';
    let lineWidth = 2;
    let brushType = COLOR_BRUSH;
    let px;
    let py;
    let prevRes;

    blackboardCCTX2d.lineCap  = 'round';
    blackboardCCTX2d.lineJoin = 'round';

    /**
     * A mouse down event handler.
     */
    function _blackboardMouseDownHandler() {
        updatePrevCursorCoords();

        window.addEventListener('mousemove', function _mmHandler() {
            isMoved = true;
            window.removeEventListener('mousemove', _mmHandler);
        });
        window.onmousemove = () => {
            if (keyCombination !== KEY_ALT_ON_PRESS) {
                _draw();
            }
            else {
                togglePalette(true);
                window.onmousemove = () => {
                    highlightMouseOnPaletteItem();
                };
            }
        }
        window.onmouseup = () => {
            window.onmousemove = null;
    
            if (!isPaletteShowed) {
                if (isMoved) {
                    updateDrawHistory();
                    isMoved = false;
                }
            }
            else {
                changeBrushSetting();
                togglePalette(false);
                updateProgramStateText(`Blackboard mode::type ${brushType === 0 ? 'brush' : 'eraser'}::color ${lineColor}::thickness ${lineWidth}`);
            }
        };
    }

    /**
     * A wheel event handler.
     */
    function _blackboardWheelHandler(event) {
        changeBrushWidth(event);
        updateProgramStateText(`Blackboard mode::type ${brushType === 0 ? 'brush' : 'eraser'}::color ${lineColor}::thickness ${lineWidth}`);
    }

    return {
        onmousedown: _blackboardMouseDownHandler,
        onwheel: _blackboardWheelHandler
    };
    
    /**
     * This functions draws a line to where
     * the cursor locates.
     */
    function _draw() {
        if (brushType === COLOR_BRUSH) {
            blackboardCCTX2d.beginPath();
            blackboardCCTX2d.strokeStyle = lineColor;
            blackboardCCTX2d.lineWidth = lineWidth;
            blackboardCCTX2d.moveTo(prevCursorCoords.x, prevCursorCoords.y);
            blackboardCCTX2d.lineTo(cursorCoords.x, cursorCoords.y);
            blackboardCCTX2d.stroke();
        }
        // brushType === TRPRT_BRUSH
        else {
            blackboardCCTX2d.beginPath();
            blackboardCCTX2d.strokeStyle = 'rgb(0, 0, 0, 1)';
            blackboardCCTX2d.lineWidth = lineWidth;
            blackboardCCTX2d.moveTo(prevCursorCoords.x, prevCursorCoords.y);
            blackboardCCTX2d.lineTo(cursorCoords.x, cursorCoords.y);
            blackboardCCTX2d.stroke();
        }
        
        updatePrevCursorCoords();
    }

    /**
     * This function switches the state of the palette.
     * @param {boolean} bool true for show, false for hide
     */
    function togglePalette(bool) {
        if (bool) {
            px = cursorCoords.x - 72;
            py = cursorCoords.y - 79;
            $palette.resetHighlightedItem();
            $palette.style.left = `${px}px`;
            $palette.style.top = `${py}px`;
            $palette.style.visibility = 'visible';
            isPaletteShowed = true;
        }
        else {
            $palette.style.visibility = 'hidden';
            isPaletteShowed = false;
        }
    }

    /**
     * This function performs a hit test of the cursor
     * against palette items.
     */
    function paletteItemCursorHitTest() {
        const r = $palette.calcRect({ px, py });
        const cx = cursorCoords.x;
        const cy = cursorCoords.y;
        let hitTestCode = null;

        for (const i in r) {
            const isOnItem =    r[i].x1 <= cx && cx <= r[i].x2
                             && r[i].y1 <= cy && cy <= r[i].y2;
            if (isOnItem) {
                hitTestCode = i;
                return hitTestCode;
            }
        }

        $palette.resetHighlightedItem();
        prevRes = hitTestCode;

        return hitTestCode;
    }

    /**
     * This function highlights a palette item
     * which the cursor is currently on.
     * Otherwise, it doesn't highlight anything.
     */
    function highlightMouseOnPaletteItem() {
        const res = paletteItemCursorHitTest();
        if (res === prevRes) return;
        if (!res) {
            $palette.resetHighlightedItem();
            return;
        }

        $palette.resetHighlightedItem();
        $palette.highlight(res);
        actx.playSoundEffect('paletteItemHover');
        prevRes = res;
    }

    /**
     * This function is for initializing an array
     * which is to have particle data.
     * @param {number} num the number of particles.
     */
    function _initParticleDataForPalette(num) {
        const arr = [];

        for (let i = 0; i < num; i++) {
            const size = randPInt(8, 10);
            const direction = randPInt(0, 359);
            const color = 3;
            const angle = randPInt(0, 359);
            const currentCursorX = cursorCoords.x;
            const currentCursorY = cursorCoords.y;
    
            arr[i] = { size, direction, color, angle, currentCursorX, currentCursorY };
        }

        return arr;
    }

    /**
     * This function changes the current brush setting
     * which can be selected from the palette gui.
     */
    function changeBrushSetting() {
        const res = paletteItemCursorHitTest();
        if (!res) return;

        switch (res) {
            case 'bkp':
                lineColor = 'black';
                break;

            case 'rp':
                lineColor = 'red';
                break;

            case 'gp':
                lineColor = 'green';
                break;

            case 'bep':
                lineColor = 'blue';
                break;

            case 'br':
                brushType = COLOR_BRUSH;
                blackboardCCTX2d.globalCompositeOperation = 'source-over';
                break;

            case 'er':
                brushType = TRPRT_BRUSH;
                blackboardCCTX2d.globalCompositeOperation = 'destination-out';
                break;
        }

        $palette.resetHighlightedItem();
        drawClickEffect(_initParticleDataForPalette(3));
        actx.playSoundEffect('paletteItemChosen');
    }

    /**
     * This function changes the current brush width
     * according to the mouse wheel event.
     */
    function changeBrushWidth(e) {
        if (e.deltaY < 0) {
            if (lineWidth === MAX_LINE_WIDTH) {
                actx.playSoundEffect('fail');
            }
            else {
                lineWidth++;
                const volume = lineWidth / MAX_LINE_WIDTH;
                actx.playSoundEffect('paletteWheelEvent', volume);
            }
        }
        else if (e.deltaY > 0) {
            if (lineWidth === MIN_LINE_WIDTH) {
                actx.playSoundEffect('fail')
            }
            else {
                lineWidth--;
                const volume = lineWidth / MAX_LINE_WIDTH;
                actx.playSoundEffect('paletteWheelEvent', volume);
            }
        }
    }
}

/**
 * These two functions enables/disables to receive mouse down events on `$blackboard`.
 */
function activateBlackboardEvent() {
    window.onmousedown = _blackboardEventHandlers.onmousedown;
    window.onwheel = _blackboardEventHandlers.onwheel;
}

function deactivateBlackboardEvent() {
    window.onmousedown = null;
    window.onwheel = null;
}