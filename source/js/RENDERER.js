// RENDERER.js
// This file is an entry point of all features
// will happen in ENTRY_POINT.html.

const _startTime = performance.now();
let screenSize;

function globalVariableInit() {
    return new Promise(async (resolve) => {
        screenSize = await window.electronAPI.requestScreenSize();
        resolve();
    });
}

// Entry point
globalVariableInit()
    .then(() => {
        const initList = [audioInit(), webcamInit(), blackboardInit(), userInterfaceInit(), shortcutInit()];

        Promise.all(initList)
            .then(() => {
                const _endTime = performance.now();
                const dt = (_endTime - _startTime).toFixed(3);
                intoTypingMode();
                updateProgramStateText(`Successful program initialization: ${dt}ms\r\nDeveloped by Cor (logicseeker@naver.com)`);
            });
    });