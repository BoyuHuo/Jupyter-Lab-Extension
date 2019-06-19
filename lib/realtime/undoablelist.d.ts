/// <reference types="google-drive-realtime-api" />
import { JSONValue } from '@phosphor/coreutils';
import { IObservableUndoableList } from '@jupyterlab/observables';
import { GoogleList } from './list';
/**
 * A concrete implementation of a realtime undoable list.
 */
export declare class GoogleUndoableList<T extends JSONValue> extends GoogleList<T> implements IObservableUndoableList<T> {
    /**
     * Construct a new undoable list.
     */
    constructor(list: gapi.drive.realtime.CollaborativeList<T>);
    /**
     * Whether the object can redo changes.
     */
    readonly canRedo: boolean;
    /**
     * Whether the object can undo changes.
     */
    readonly canUndo: boolean;
    /**
     * Begin a compound operation.
     *
     * @param isUndoAble - Whether the operation is undoable.
     *   The default is `true`.
     */
    beginCompoundOperation(isUndoAble?: boolean): void;
    /**
     * End a compound operation.
     */
    endCompoundOperation(): void;
    /**
     * Undo an operation.
     */
    undo(): void;
    /**
     * Redo an operation.
     */
    redo(): void;
    /**
     * Clear the change stack.
     */
    clearUndo(): void;
    /**
     * Handle a change in the list.
     */
    private _onListChanged;
    /**
     * Undo a change event.
     */
    private _undoChange;
    /**
     * Redo a change event.
     */
    private _redoChange;
    /**
     * Copy a change as JSON.
     */
    private _copyChange;
    private _inCompound;
    private _isUndoable;
    private _madeCompoundChange;
    private _index;
    private _stack;
}
