// CursorTraceList.js
// This file defines a class for saving
// mouse cursor coordinates.

// CursorTraceList is composed of this object.
class CursorTraceElement {
    // new CursorTraceElement(x, y)
    constructor(_x, _y) {
        this.next = null;
        this.prev = null;
        this.x = _x;
        this.y = _y;
    }
}

// This is a doubly linked list which has
// a length limit. Adding to the full list
// will lead to drop the first element and
// add a new element after the last element.
class CursorTraceList {
    #lengthLimit;

    // new CursorTraceList(lengthLimit)
    constructor(_lengthLimit) {
        this.#lengthLimit = _lengthLimit;
        this.length = 0;
        this.firstElement = null;
        this.lastElement = null;
    }
    
    /**
     * This method adds an element before
     * the first element.
     */
    insertBeforeFirst(cursorTraceElement) {
        if (this.length === this.#lengthLimit) {
            this.lastElement.prev.next = null;
            this.lastElement = this.lastElement.prev; // deleteLast()
            cursorTraceElement.next = this.firstElement;
            this.firstElement.prev = cursorTraceElement;
            this.firstElement = cursorTraceElement;
        }
        else if (0 < this.length) {
            cursorTraceElement.next = this.firstElement;
            this.firstElement.prev = cursorTraceElement;
            this.firstElement = cursorTraceElement;
            this.length++;
        }
        // Perform initialization when this.length === 0
        else {
            this.firstElement = cursorTraceElement;
            this.lastElement = cursorTraceElement;
            this.length++;
        }
    }

    /**
     * This method deletes a last element.
     */
    deleteLast() {
        if (1 < this.length) {
            this.lastElement.prev.next = null;
            this.lastElement = this.lastElement.prev;
        }
        // this.length === 1
        else {
            this.firstElement = null;
            this.lastElement = null;
        }

        this.length--;
    }
}