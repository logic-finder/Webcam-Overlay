// audio.js
// This file defines an AudioContext object
// and attach a custom method to it.

const actx = new AudioContext();

/**
 * This function prepares `actx` in order for it
 * to play sounds in this program.
 */
function audioInit() {
    return new Promise(async (resolve) => {
        const volumeController = new GainNode(actx, { gain: 1 });
        const receivedData = await window.electronAPI.onAudioBufferReady();
        
        actx.audioBuffers = new Object();

        /**
         * This method plays a sound effect.
         */
        actx.playSoundEffect = (name, volume = 1) => {
            const soundEffect = new AudioBufferSourceNode(actx, { buffer: actx.audioBuffers[name] });

            volumeController.gain.value = volume;
            soundEffect.connect(volumeController);
            volumeController.connect(actx.destination);
            soundEffect.start();
        }

        // Decoding audio data received from main.js.
        for (const audioBuffer in receivedData) {
            try {
                actx.audioBuffers[audioBuffer] = await actx.decodeAudioData(receivedData[audioBuffer]);
            }   
            catch (error) {
                throw new Error(`decodeAudioData(): ${audioBuffer} ${error}`);
            }
        }

        resolve();
    });
}