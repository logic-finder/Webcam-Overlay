// webcam.js
// This file handles the webcam feature.

const WEBCAM_WIDTH = 1280;
const WEBCAM_HEIGHT = 720;
const webcamConstraints = {
    audio: false,
    video: {
        width: WEBCAM_WIDTH,
        height: WEBCAM_HEIGHT
    }
};
let $webcam;

/**
 * This function attempts to get a webcam.
 */
function webcamInit() {
    const TRIAL_LIMIT = 2;
    let tryCount = 0;

    return new Promise((resolve, reject) => {
        _tryGetWebcam();

        function _tryGetWebcam() {
            navigator.mediaDevices.getUserMedia(webcamConstraints)
                .then((webcamStream) => {
                    $webcam = document.createElement('resizing-video');
                    $webcam.hwRatio = WEBCAM_HEIGHT / WEBCAM_WIDTH;
                    $webcam.video.srcObject = webcamStream;
                    $webcam.video.addEventListener('loadeddata', $webcam.video.play);
                    document.body.prepend($webcam);

                    resolve();
                })
                .catch(() => {
                    if (tryCount === TRIAL_LIMIT) {
                        reject();
                        return;
                    }
                    
                    tryCount++;
                    _tryGetWebcam();
                });
        }
    });
}