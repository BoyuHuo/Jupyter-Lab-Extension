"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const list_1 = require("./list");
/**
 * A concrete implementation of a realtime undoable list.
 */
class GoogleUndoableList extends list_1.GoogleList {
    /**
     * Construct a new undoable list.
     */
    constructor(list) {
        super(list);
        this._inCompound = false;
        this._isUndoable = true;
        this._madeCompoundChange = false;
        this._index = -1;
        this._stack = [];
        this.changed.connect(this._onListChanged, this);
    }
    /**
     * Whether the object can redo changes.
     */
    get canRedo() {
        return this._index < this._stack.length - 1;
    }
    /**
     * Whether the object can undo changes.
     */
    get canUndo() {
        return this._index >= 0;
    }
    /**
     * Begin a compound operation.
     *
     * @param isUndoAble - Whether the operation is undoable.
     *   The default is `true`.
     */
    beginCompoundOperation(isUndoAble) {
        this._inCompound = true;
        this._isUndoable = isUndoAble !== false;
        this._madeCompoundChange = false;
    }
    /**
     * End a compound operation.
     */
    endCompoundOperation() {
        this._inCompound = false;
        this._isUndoable = true;
        if (this._madeCompoundChange) {
            this._index++;
        }
    }
    /**
     * Undo an operation.
     */
    undo() {
        if (!this.canUndo) {
            return;
        }
        const changes = this._stack[this._index];
        this._isUndoable = false;
        for (let change of changes.reverse()) {
            this._undoChange(change);
        }
        this._isUndoable = true;
        this._index--;
    }
    /**
     * Redo an operation.
     */
    redo() {
        if (!this.canRedo) {
            return;
        }
        this._index++;
        const changes = this._stack[this._index];
        this._isUndoable = false;
        for (let change of changes) {
            this._redoChange(change);
        }
        this._isUndoable = true;
    }
    /**
     * Clear the change stack.
     */
    clearUndo() {
        this._index = -1;
        this._stack = [];
    }
    /**
     * Handle a change in the list.
     */
    _onListChanged(list, change) {
        if (this.isDisposed || !this._isUndoable) {
            return;
        }
        // Clear everything after this position if necessary.
        if (!this._inCompound || !this._madeCompoundChange) {
            this._stack = this._stack.slice(0, this._index + 1);
        }
        // Copy the change.
        const evt = this._copyChange(change);
        // Put the change in the stack.
        if (this._stack[this._index + 1]) {
            this._stack[this._index + 1].push(evt);
        }
        else {
            this._stack.push([evt]);
        }
        // If not in a compound operation, increase index.
        if (!this._inCompound) {
            this._index++;
        }
        else {
            this._madeCompoundChange = true;
        }
    }
    /**
     * Undo a change event.
     */
    _undoChange(change) {
        let index = 0;
        switch (change.type) {
            case 'add':
                algorithm_1.each(change.newValues, () => {
                    this.remove(change.newIndex);
                });
                break;
            case 'set':
                index = change.oldIndex;
                algorithm_1.each(change.oldValues, value => {
                    this.set(index++, value);
                });
                break;
            case 'remove':
                index = change.oldIndex;
                algorithm_1.each(change.oldValues, value => {
                    this.insert(index++, value);
                });
                break;
            case 'move':
                this.move(change.newIndex, change.oldIndex);
                break;
            default:
                return;
        }
    }
    /**
     * Redo a change event.
     */
    _redoChange(change) {
        let index = 0;
        switch (change.type) {
            case 'add':
                index = change.newIndex;
                algorithm_1.each(change.newValues, value => {
                    this.insert(index++, value);
                });
                break;
            case 'set':
                index = change.newIndex;
                algorithm_1.each(change.newValues, value => {
                    this.set(change.newIndex++, value);
                });
                break;
            case 'remove':
                algorithm_1.each(change.oldValues, () => {
                    this.remove(change.oldIndex);
                });
                break;
            case 'move':
                this.move(change.oldIndex, change.newIndex);
                break;
            default:
                return;
        }
    }
    /**
     * Copy a change as JSON.
     */
    _copyChange(change) {
        const oldValues = [];
        algorithm_1.each(change.oldValues, value => {
            oldValues.push(value);
        });
        const newValues = [];
        algorithm_1.each(change.newValues, value => {
            newValues.push(value);
        });
        return {
            type: change.type,
            oldIndex: change.oldIndex,
            newIndex: change.newIndex,
            oldValues,
            newValues
        };
    }
}
exports.GoogleUndoableList = GoogleUndoableList;
