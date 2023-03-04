// PaintPalette.js
// This files defines a custom element for
// displaying a palette in Blackboard mode.

class PaintPalette extends HTMLElement {
    // Private variables
    #black;
    #red;
    #green;
    #blue;
    #brush;
    #eraser;

    // document.createElement('paint-palette')
    constructor() {
        super();

        const $root = this.attachShadow({ mode: 'open' });
        const $palette  = document.createElement('div');
        const $black    = document.createElement('div');
        const $red      = document.createElement('div');
        const $green    = document.createElement('div');
        const $blue     = document.createElement('div');
        const $toolBar  = document.createElement('div');
        const $brush    = document.createElement('div');
        const $eraser   = document.createElement('div');
        const $style = document.createElement('style');

        this.#black  = $black;
        this.#red    = $red;
        this.#green  = $green;
        this.#blue   = $blue;
        this.#brush  = $brush;
        this.#eraser = $eraser;

        $palette.id = 'palette';
        $black.id   = 'black';
        $red.id     = 'red';
        $green.id   = 'green';
        $blue.id    = 'blue';
        $toolBar.id = 'tool-bar';
        $brush.id   = 'brush';
        $eraser.id  = 'eraser';
        $black.className = $red.className = $green.className = $blue.className = 'paint';
        $brush.className = $eraser.className = 'tool';
        $style.textContent = `
            div#palette {
                position: absolute;
                left: 0px;
                top: 0px;
                border: 1px solid lightgray;
                border-radius: 5px;
                width: 145px;
                height: 40px;
                box-shadow: 2px 2px 5px lightgray;
                user-select: none;
            }

            div#palette div.paint {
                position: absolute;
                top: 5px;
                border-radius: 5px;
                width: 30px;
                height: 30px;
            }

            div#palette div#black {
                left: 5px;
                background-color: black;
            }

            div#palette div#red {
                left: 40px;
                background-color: red;
            }

            div#palette div#green {
                left: 75px;
                background-color: green;
            }

            div#palette div#blue {
                left: 110px;
                background-color: blue;
            }

            div#tool-bar {
                position: absolute;
                left: 0px;
                top: 112px;
                border: 1px solid lightgray;
                border-radius: 5px;
                width: 79px;
                height: 42px;
                box-shadow: 2px 2px 5px lightgray;
            }

            div#tool-bar div.tool {
                position: absolute;
                top: 5px;
                border: 1px solid lightgray;
                border-radius: 5px;
                width: 30px;
                height: 30px;
                overflow: hidden;
            }

            div#tool-bar div#brush {
                left: 5px;
                background-image: url('icon/brush.bmp');
                background-position-x: 0px;
            }

            div#tool-bar div#eraser {
                left: 42px;
                background-image: url('icon/eraser.bmp');
                background-position-x: 0px;
            }
        `;
        
        $palette.append($black, $red, $green, $blue);
        $toolBar.append($brush, $eraser);
        $root.append($style, $palette, $toolBar);
    }

    /**
     * As far as I know, `connectedCallback()` is
     * invoked when this element is appended
     * to `document.body`.
     */
    connectedCallback() {
        this.style.position = 'absolute';
    }

    /**
     * This method returns a object which indicates
     * coordinates for each palette items so that
     * I can decide what actions I should perform,
     * given a current mouse-up coordinates.
     * ※ Actually, I think the easiest way to implement
     * this feature is just to add mouseup event listeners
     * on each palette items. However, it is more fun to
     * try other methods.
     */
    calcRect({ px, py }) {
        const ptop1 = 5  + py;
        const ptop2 = 35 + py;
        const ttop1 = 117 + py;
        const ttop2 = 147 + py;
        return {
            bkp: { x1: 5   + px, y1: ptop1, x2: 35  + px, y2: ptop2 },
            rp:  { x1: 40  + px, y1: ptop1, x2: 70  + px, y2: ptop2 },
            gp:  { x1: 75  + px, y1: ptop1, x2: 105 + px, y2: ptop2 },
            bep: { x1: 110 + px, y1: ptop1, x2: 140 + px, y2: ptop2 },
            br:  { x1: 5   + px, y1: ttop1, x2: 35  + px, y2: ttop2 },
            er:  { x1: 40  + px, y1: ttop1, x2: 70  + px, y2: ttop2 }
        };
    }

    /**
     * This method resets a highlighted item by
     * resetting all.
     */
    resetHighlightedItem() {
        this.#black.style.backgroundColor = 'black';
        this.#red.style.backgroundColor   = 'red';
        this.#green.style.backgroundColor = 'green';
        this.#blue.style.backgroundColor  = 'blue';
        this.#brush.style.backgroundPositionX  = '0px';
        this.#eraser.style.backgroundPositionX = '0px';
    }

    /**
     * This method gives a focus to a hovered item.
     * @param {string} propName an item to highlight.
     */
    highlight(propName) {
        switch (propName) {
            case 'bkp':
                this.#black.style.backgroundColor = 'rgb(63, 63, 63)';
                break;
            case 'rp':
                this.#red.style.backgroundColor = 'rgb(255, 63, 63)';
                break;
            case 'gp':
                this.#green.style.backgroundColor = 'rgb(28, 178, 77)';
                break;
            case 'bep':
                this.#blue.style.backgroundColor = 'rgb(0, 127, 255)';
                break;
            case 'br':
                this.#brush.style.backgroundPositionX = '-30px';
                break;
            case 'er':
                this.#eraser.style.backgroundPositionX = '-30px';
        }
    }
}

// Register
customElements.define('paint-palette', PaintPalette);