// PRELOAD.js
// This file defines some functions to communicate
// between MAIN.js and RENDERER.js, since RENDERER.js
// is called in ENTRY_POINT.html and such javascript
// can't access to the computer.

const Electron = require('electron');

Electron.contextBridge.exposeInMainWorld('electronAPI', {
    quit: () => Electron.ipcRenderer.send('signal::quit'),
    
    intoTypingMode: () => Electron.ipcRenderer.send('signal::intoTypingMode'),

    intoBlackboardMode: () => Electron.ipcRenderer.send('signal::intoBlackboardMode'),

    intoWebcamMode: () => Electron.ipcRenderer.send('signal::intoWebcamMode'),

    // The reason I used Promise here rather than a callback function:
    // in order to write a code that looks neat.
    onAudioBufferReady: () => {
        return new Promise((resolve) => {
            Electron.ipcRenderer.on('signal::audioBufferReady', (event, data) => {
                resolve(data);
            });
        });
    },

    onMouseMove: (callback) => {
        Electron.ipcRenderer.on('signal::mouseMove', callback);
    },

    onMouseClick: (callback) => {
        Electron.ipcRenderer.on('signal::mouseClick', callback);
    },

    onKeycode: (callback) => {
        Electron.ipcRenderer.on('signal::keycode', callback);
    },

    onWindowTitle: (callback) => {
        Electron.ipcRenderer.on('signal::windowTitle', callback);
    },

    requestScreenSize: () => {
        Electron.ipcRenderer.send('signal::requestScreenSize');

        return new Promise((resolve) => {
            Electron.ipcRenderer.on('signal::responseScreenSize', (event, data) => {
                resolve(data);
            });
        });
    },

    // For debug
    testmsg: (text) => Electron.ipcRenderer.send('testmsg', text)
});