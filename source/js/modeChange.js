// modeChange.js
// This file defines three functions
// which are used to switch modes.

let currentMode;

/**
 * This function changes the current mode
 * to Typing mode.
 */
function intoTypingMode() {
    if (currentMode !== 0) {
        currentMode = 0;
        window.electronAPI.intoTypingMode();
        deactivateBlackboardEvent();
        $webcam.deactivateEvent();
        $webcam.style.zIndex = 0;
        updateProgramStateText(`Changed to Typing mode.`);
        actx.playSoundEffect('success');
    }
    else {
        actx.playSoundEffect('fail');
    }
}

/**
 * This function changes the current mode
 * to Blackboard mode.
 */
function intoBlackboardMode() {
    if (currentMode !== 1) {
        currentMode = 1;
        window.electronAPI.intoBlackboardMode();
        activateBlackboardEvent();
        $webcam.deactivateEvent();
        $webcam.style.zIndex = 0;
        updateProgramStateText(`Changed to Blackboard mode.`);
        actx.playSoundEffect('success');
    }
    else {
        actx.playSoundEffect('fail');
    }
}

/**
 * This function changes the current mode
 * to Webcam mode.
 */
function intoWebcamMode() {
    if (currentMode !== 2) {
        currentMode = 2;
        window.electronAPI.intoWebcamMode();
        deactivateBlackboardEvent();
        $webcam.activateEvent();
        $webcam.style.zIndex = 999; // For receiving mouse events
        updateProgramStateText(`Changed to Webcam mode.`);
        actx.playSoundEffect('success');
    }
    else {
        actx.playSoundEffect('fail');
    }
}