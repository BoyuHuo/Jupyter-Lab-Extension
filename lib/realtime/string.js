"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const signaling_1 = require("@phosphor/signaling");
/**
 * Realtime string which wraps `gapi.drive.realtime.CollaborativeString`.
 */
class GoogleString {
    /**
     * Constructor for the string.
     */
    constructor(str) {
        this._changed = new signaling_1.Signal(this);
        this._isDisposed = false;
        this.googleObject = str;
    }
    /**
     * The type of the Observable.
     */
    get type() {
        return 'String';
    }
    /**
     * Set the value of the string.
     */
    set text(value) {
        if (this._str.length === value.length && this._str.getText() === value) {
            return;
        }
        this._str.setText(value);
        this._changed.emit({
            type: 'set',
            start: 0,
            end: value.length,
            value: value
        });
    }
    /**
     * Get the value of the string.
     */
    get text() {
        return this._str.getText();
    }
    /**
     * Get the underlying `gapi.drive.realtime.CollaborativeString`
     * for this string.
     */
    get googleObject() {
        return this._str;
    }
    /**
     * Set the underlying `gapi.drive.realtime.CollaborativeString`
     * for this string.
     */
    set googleObject(str) {
        let prevText = '';
        if (this._str) {
            prevText = this._str.getText();
            this._str.removeAllEventListeners();
        }
        // Set the new string.
        this._str = str;
        // Add event listeners to the CollaborativeString.
        this._str.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, (evt) => {
            if (!evt.isLocal) {
                this._changed.emit({
                    type: 'insert',
                    start: evt.index,
                    end: evt.index + evt.text.length,
                    value: evt.text
                });
            }
        });
        this._str.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, (evt) => {
            if (!evt.isLocal) {
                this._changed.emit({
                    type: 'remove',
                    start: evt.index,
                    end: evt.index + evt.text.length,
                    value: evt.text
                });
            }
        });
        // Trigger text set event if necessary.
        if (prevText !== this._str.getText()) {
            this._changed.emit({
                type: 'set',
                start: 0,
                end: this._str.length,
                value: this._str.getText()
            });
        }
    }
    /**
     * A signal emitted when the string has changed.
     */
    get changed() {
        return this._changed;
    }
    /**
     * Insert a substring.
     *
     * @param index - The starting index.
     *
     * @param text - The substring to insert.
     */
    insert(index, text) {
        this._str.insertString(index, text);
        this._changed.emit({
            type: 'insert',
            start: index,
            end: index + text.length,
            value: text
        });
    }
    /**
     * Remove a substring.
     *
     * @param start - The starting index.
     *
     * @param end - The ending index.
     */
    remove(start, end) {
        const oldValue = this.text.slice(start, end);
        this._str.removeRange(start, end);
        this._changed.emit({
            type: 'remove',
            start: start,
            end: end,
            value: oldValue
        });
    }
    /**
     * Set the ObservableString to an empty string.
     */
    clear() {
        this.text = '';
    }
    /**
     * Test whether the string has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resources held by the string.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._str.removeAllEventListeners();
        signaling_1.Signal.clearData(this);
        this._isDisposed = true;
    }
}
exports.GoogleString = GoogleString;
