// ResizingVideo.js
// This file defines a custom element which is
// basically a built-in <video> element but
// also has a <div> element in addition in order
// to give users a way to resize the video element.

class ResizingVideo extends HTMLElement {
    // Private variables
    #INITIAL_WIDTH;
    #INITIAL_HEIGHT;
    #offset;
    #isVisible;

    // document.createElement('resizing-video')
    constructor() {
        super();

        this.#INITIAL_WIDTH = 320;
        this.#INITIAL_HEIGHT = 180;
        this.#isVisible = true;
        this.#offset = {
            x: 20,
            y: 120
        };

        const $root = this.attachShadow({ mode: 'open' });
        const $video   = document.createElement('video');
        const $resizer = document.createElement('div');
        const $style   = document.createElement('style');

        $video.id   = 'video';
        $resizer.id = 'resizer';
        this.video   = $video;
        this.resizer = $resizer;

        $style.textContent = `
            video#video {
                position: absolute;
                width:  ${this.#INITIAL_WIDTH}px;
                height: ${this.#INITIAL_HEIGHT}px;
                border: 1px solid gray;
                border-radius: 6px;
                cursor: move;
                user-select: none;
            }

            div#resizer {
                position: absolute;
                width: 12px;
                height: 12px;
                top: -5px;
                left: -5px;
                border: 1px solid lightgray;
                border-radius: 6px;
                background-color: rgba(63, 72, 204, 0.75);
                cursor: nwse-resize;
                user-select: none;
            }
        `;

        $root.append($style, $video, $resizer);
    }

    /**
     * As far as I know, `connectedCallback()` is
     * invoked when this element is appended
     * to `document.body`.
     */
    connectedCallback() {
        this.style.position = 'absolute';
        this.#repositionThis(screenSize.cx - this.#INITIAL_WIDTH - this.#offset.x, screenSize.cy - this.#INITIAL_HEIGHT - this.#offset.y);
    }

    /**
     * These two functions enables/disables to resize/move the element.
     */
    activateEvent() {
        this.resizer.onmousedown = this._resizerMouseDownHandler.bind(this);
        window.onmouseup = () => {
            window.onmousemove = null;
        }

        this.video.onmousedown = this._videoMouseDownHandler.bind(this);
        this.video.onmouseup = () => {
            this.video.onmousemove = null;
        }
    }

    deactivateEvent() {
        this.resizer.onmousedown = null;
        this.video.onmousedown = null;
    }

    /**
     * A callback function to mouse down events on `$resizer`.
     */
    _resizerMouseDownHandler() {
        const r = this.video.getBoundingClientRect();

        window.onmousemove = ((event) => {
            const dx = r.left - event.x;
            const calcWidth = r.width + dx;
            // 1280 : 720 = width : height
            // height = width * (720 / 1280) = width * ratio
            const calcHeight = calcWidth * this.hwRatio;
            const dy = calcHeight - r.height;

            this.#resizeWebcam(calcWidth, calcHeight);
            this.#repositionThis(event.x, r.top - dy);
        });
    }

    /**
     * A callback funciton to mouse down events on `$video`.
     * @param {Event} event mouse down event
     */
    _videoMouseDownHandler(event) {
        const r = this.video.getBoundingClientRect();
        let dx = event.x - r.left;
        let dy = event.y - r.top;

        this.video.onmousemove = ((event) => {
            this.#repositionThis(event.x - dx, event.y - dy);
        }).bind(this);
    }

    /**
     * This function re-sizes `$video` element.
     * @param {number} width width
     * @param {number} height height
     */
    #resizeWebcam(width, height) {
        this.video.style.width  = `${width}px`;
        this.video.style.height = `${height}px`;

        return height;
    }

    /**
     * This function re-positions the custom element which
     * has the shadow root which has `$video` and `$resizer`.
     * @param {number} left x
     * @param {number} top y
     */
    #repositionThis(left, top) {
        this.style.left = `${left}px`;
        this.style.top  = `${top}px`;
    }

    /**
     * This function toggles the visibleness of the element.
     */
    switchVisibleness() {
        if (this.#isVisible) this.style.visibility = 'hidden';
        else this.style.visibility = 'visible';
        
        this.#isVisible = !this.#isVisible;
    }

    /**
     * This function restores the default setting of the element.
     */
    restoreDefaultSetting() {
        this.#resizeWebcam(this.#INITIAL_WIDTH, this.#INITIAL_HEIGHT);
        this.#repositionThis(screenSize.cx - this.#INITIAL_WIDTH - this.#offset.x, screenSize.cy - this.#INITIAL_HEIGHT - this.#offset.y);
    }
}

// Register
customElements.define('resizing-video', ResizingVideo);