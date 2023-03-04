// MAIN.js
// This file is a entry point of this program.

// require
const Electron = require('electron');
const Node = {
    path: require('node:path'),
    fs: require('node:fs'),
    child_process: require('node:child_process')
}

// Declarations
const HOOK_INSTALLED			= 2;
const MOUSE_MOVE_HAPPEN		    = 3;
const MOUSE_CLICK_HAPPEN		= 4;
const KEYBOARD_DOWN_HAPPEN	    = 5;
const CURRENT_WINDOW_TITLE	    = 6;
const screenSize = {};
let hookingProcess;

// Entry point
Electron.app.whenReady().then(() => {
    // Creating the main window
    // 800x600 has no meaning, since this program occupies full screen.
    const mainWindow = createWindow(800, 600, '../ENTRY_POINT.html', 'PRELOAD.js');

    // Other initializations
    initHookingProcess(mainWindow);
    initIPC(mainWindow);
    mainWindow.webContents.on('did-finish-load', () => {
        initSoundEffects(mainWindow);
    });
});

// Program exit
Electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        hookingProcess.kill('SIGKILL');
        Electron.app.quit();
    }
});

/**
 * This function creates a window with given parameters.
 * @param {number} width width of the window.
 * @param {number} height height of the window.
 * @param {string} htmlPath a html file that this window uses.
 * @param {string} preloadPath a preload file that this window uses.
 * @return {BrowserWindow} a newly created window.
 */
function createWindow(width, height, htmlPath, preloadPath) {
    const window = new Electron.BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true,
            preload: Node.path.join(__dirname, preloadPath)
        },
        frame: false,
        resizable: false,
        fullscreen: true,
        transparent: true,
        alwaysOnTop: true
    });

    window.loadFile(htmlPath);

    return window;
};

/**
 * This function initializes the hooking process.
 */
function initHookingProcess(window) {
    // Spawining the hooking process
    hookingProcess = Node['child_process'].spawn('source/hookInstall.exe');

    // Stdout processing from the hooking process
    hookingProcess.stdout.setEncoding('utf-8');
    hookingProcess.stdout.on('data', _stdoutCallback);

    const SIGNAL_TYPE_BIT = 8;

    function _stdoutCallback(data) {
        let pointer = 0;

        while (pointer < data.length) {
            /* Signals come from the hooking process:
             * TYPE NAME                    VALUE       LENGTH      CONTENT
             * FAILED_WINDOW_CREATION         0         8           signal type only (signal type: 8)
             * SUCCESS_WINDOW_CREATION        1         8           signal type only
             * HOOK_INSTALLED                 2         72          signal type, screenX, screenY (sX, sY: 32 each)
             * MOUSE_MOVE_HAPPEN              3         72          signal type, mouseX, mouseY (mX, mY: 32 each)
             * MOUSE_CLICK_HAPPEN             4         72          signal type, mouseX, mouseY (mX, mY: 32 each)
             * KEYBOARD_DOWN_HAPPEN           5         16          signal type, virtual key code (vkCode: 8)
             * CURRENT_WINDOW_TITLE           6         40+n        signal type, title length, title (title length: 32)
             */

            const signalType = Number('0b' + data.substring(pointer, pointer += SIGNAL_TYPE_BIT));

            switch (signalType) {
                case HOOK_INSTALLED: {
                    const signalData = data.substring(pointer, pointer += 64);
                    screenSize.cx = Number('0b' + signalData.substring(0, 32));
                    screenSize.cy = Number('0b' + signalData.substring(32, 64));
                    break;
                }

                case MOUSE_MOVE_HAPPEN: {
                    const signalData = data.substring(pointer, pointer += 64);
                    let x = Number('0b' + signalData.substring(0, 32));
                    let y = Number('0b' + signalData.substring(32, 64));

                    // If you locate your cursor to the uppermost
                    // and/or the leftmost side, cursor.x and ~.y
                    // sometimes somewhy have a value near 4294967295, or 2^32 - 1.
                    // it's a cool effect but in case of want to fix that:
                    if (Math.clz32(x) === 0) x = 0;
                    if (Math.clz32(y) === 0) y = 0;

                    window.webContents.send('signal::mouseMove', { x, y });
                    break;
                }

                case MOUSE_CLICK_HAPPEN: {
                    const signalData = data.substring(pointer, pointer += 64);
                    let x = Number('0b' + signalData.substring(0, 32));
                    let y = Number('0b' + signalData.substring(32, 64));
                    
                    if (Math.clz32(x) === 0) x = 0;
                    if (Math.clz32(y) === 0) y = 0;

                    window.webContents.send('signal::mouseClick', { x, y });
                    break;
                }

                case KEYBOARD_DOWN_HAPPEN: {
                    const virtualKeyCode = Number('0b' + data.substring(pointer, pointer += 8));

                    window.webContents.send('signal::keycode', virtualKeyCode);
                    break;
                }

                case CURRENT_WINDOW_TITLE: {
                    const titleLength = -1 + Number('0b' + data.substring(pointer, pointer += 32));
                    const windowTitle = data.substring(pointer, pointer += titleLength);
                    
                    window.webContents.send('signal::windowTitle', windowTitle);
                    break;
                }
            }
        }
    }
}

/**
 * This function is used in `initSoundEffects()`
 * in order to get a specified sound file.
 */
function _getsnd(name) {
    const sound = Node.fs.readFileSync(`source/sound/${name}`);
    return sound.buffer.slice(sound.byteOffset);
}

/**
 * This function loads sound effects.
 * @param {BrowserWindow} window a window that will use sound effects.
 */
function initSoundEffects(window) {
    window.webContents.send('signal::audioBufferReady', {
        click: _getsnd('click.wav'),
        fail: _getsnd('fail.wav'),
        paletteItemHover: _getsnd('paletteItemHover.wav'),
        paletteItemChosen: _getsnd('paletteItemChosen.wav'),
        paletteWheelEvent: _getsnd('paletteWheelEvent.wav'),
        success: _getsnd('success.wav')
    });
}

/**
 * This function attaches event listeners for
 * inter-process communication (a.k.a. IPC).
 * @param {BrowserWindow} window a window that will listens to events
 */
function initIPC(window) {
    Electron.ipcMain.on('signal::quit', Electron.app.quit);
    Electron.ipcMain.on('signal::intoTypingMode', () => {
        window.focus();
        window.setIgnoreMouseEvents(true, { forward: true });
    });
    Electron.ipcMain.on('signal::intoBlackboardMode', () => {
        window.focus();
        window.setIgnoreMouseEvents(false);
    });
    Electron.ipcMain.on('signal::intoWebcamMode', () => {
        window.focus();
        window.setIgnoreMouseEvents(false);
    });
    Electron.ipcMain.on('signal::requestScreenSize', () => {
        window.webContents.send('signal::responseScreenSize', screenSize);
    });

    // For debug
    Electron.ipcMain.on('testmsg', (event, data) => {
        console.log(data);
    });
}