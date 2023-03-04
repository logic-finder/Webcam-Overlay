// shortcut.js
// This file defines shortcuts.

/**
 * This function performs an initialization
 * on key down event.
 */
function shortcutInit() {
    return new Promise((resolve) => {
        window.electronAPI.onKeycode(_keycodeHandler);
        
        resolve();
    });
}

/**
 * A key down event handler for shortcut.
 */
function _keycodeHandler(event, keycode) {
    switch (keycode) {
        case 0x1B: // Esc
            eraseBlackboard();
            break;

        case 0x70: // F1
            window.electronAPI.quit();
            break;

        case 0x71: // F2
            intoTypingMode();
            break;

        case 0x72: // F3
            intoBlackboardMode();
            break;

        case 0x73: // F4
            intoWebcamMode();
            break;

        case 0x74: { // F5
            if (currentMode === 2) {
                $webcam.switchVisibleness();
                actx.playSoundEffect('success');
            }
            else {
                actx.playSoundEffect('fail');
            }
            break;
        }
        
        case 0x75: { // F6
            if (currentMode === 2) {
                $webcam.restoreDefaultSetting();
                actx.playSoundEffect('success');
            }
            else {
                actx.playSoundEffect('fail');
            }
            break;
        }
    }
}