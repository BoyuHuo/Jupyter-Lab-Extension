"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const signaling_1 = require("@phosphor/signaling");
/**
 * Realtime map which wraps `gapi.drive.realtime.CollaborativeMap`
 */
class GoogleMap {
    /**
     * Constructor
     */
    constructor(map, itemCmp) {
        this._changed = new signaling_1.Signal(this);
        this._isDisposed = false;
        this._itemCmp = itemCmp || Private.itemCmp;
        this.googleObject = map;
    }
    /**
     * The type of the Observable.
     */
    get type() {
        return 'Map';
    }
    /**
     * A signal emitted when the map has changed.
     */
    get changed() {
        return this._changed;
    }
    /**
     * The number of key-value pairs in the map.
     */
    get size() {
        return this._map.size;
    }
    /**
     * Whether this map has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Get the underlying `gapi.drive.realtime.CollaborativeMap`
     * for this map.
     */
    get googleObject() {
        return this._map;
    }
    /**
     * Set the underlying `gapi.drive.realtime.CollaborativeMap`
     * for this object.
     */
    set googleObject(map) {
        // Recreate the new map locally to fire the right signals.
        if (this._map) {
            this.clear();
            for (let key of map.keys()) {
                this.set(key, map.get(key));
            }
            this._map.removeAllEventListeners();
        }
        // Set the new map.
        this._map = map;
        // Hook up event listeners to the new map.
        this._map.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, (evt) => {
            if (!evt.isLocal) {
                let changeType;
                if (evt.oldValue && evt.newValue) {
                    changeType = 'change';
                }
                else if (evt.oldValue && !evt.newValue) {
                    changeType = 'remove';
                }
                else {
                    changeType = 'add';
                }
                this._changed.emit({
                    type: changeType,
                    key: evt.property,
                    oldValue: evt.oldValue,
                    newValue: evt.newValue
                });
            }
        });
    }
    /**
     * Set a key-value pair in the map
     *
     * @param key - The key to set.
     *
     * @param value - The value for the key.
     *
     * @returns the old value for the key, or undefined
     *   if that did not exist.
     */
    set(key, value) {
        const oldVal = this.get(key);
        if (oldVal !== undefined && this._itemCmp(oldVal, value)) {
            return oldVal;
        }
        this._map.set(key, value);
        this._changed.emit({
            type: oldVal ? 'change' : 'add',
            key: key,
            oldValue: oldVal,
            newValue: value
        });
        return oldVal;
    }
    /**
     * Get a value for a given key.
     *
     * @param key - the key.
     *
     * @returns the value for that key.
     */
    get(key) {
        const val = this._map.get(key);
        return val === null ? undefined : val;
    }
    /**
     * Check whether the map has a key.
     *
     * @param key - the key to check.
     *
     * @returns `true` if the map has the key, `false` otherwise.
     */
    has(key) {
        return this._map.has(key);
    }
    /**
     * Get a list of the keys in the map.
     *
     * @returns - a list of keys.
     */
    keys() {
        return this._map.keys();
    }
    /**
     * Get a list of the values in the map.
     *
     * @returns - a list of values.
     */
    values() {
        return this._map.values();
    }
    /**
     * Remove a key from the map
     *
     * @param key - the key to remove.
     *
     * @returns the value of the given key,
     *   or undefined if that does not exist.
     */
    delete(key) {
        const oldVal = this.get(key);
        this._map.delete(key);
        this._changed.emit({
            type: 'remove',
            key: key,
            oldValue: oldVal,
            newValue: undefined
        });
        return oldVal;
    }
    /**
     * Set the ObservableMap to an empty map.
     */
    clear() {
        // Delete one by one so that we send
        // the appropriate signals.
        const keyList = this.keys();
        for (let i = 0; i < keyList.length; i++) {
            this.delete(keyList[i]);
        }
    }
    /**
     * Dispose of the resources held by the map.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._map.removeAllEventListeners();
        signaling_1.Signal.clearData(this);
    }
}
exports.GoogleMap = GoogleMap;
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The default strict equality item comparator.
     */
    function itemCmp(first, second) {
        return first === second;
    }
    Private.itemCmp = itemCmp;
})(Private || (Private = {}));
