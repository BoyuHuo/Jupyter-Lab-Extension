/// <reference types="google-drive-realtime-api" />
import { JSONValue } from '@phosphor/coreutils';
import { ISignal } from '@phosphor/signaling';
import { IModelDB, IObservableValue, ObservableValue, IObservableString, IObservable, IObservableUndoableList, IObservableJSON } from '@jupyterlab/observables';
import { CollaboratorMap } from './collaborator';
import { GoogleSynchronizable, IGoogleRealtimeObject } from './googlerealtime';
/**
 * A class representing an IObservableValue, which
 * listens for changes to a `gapi.drive.realtime.Model`.
 */
export declare class GoogleObservableValue implements IObservableValue {
    /**
     * Constructor for the value.
     *
     * @param path: the fully qualified path for the value (not a path on a view).
     *
     * @param model: a `gapi.drive.realtime.Model` in which to store the value.
     *
     * @param initialValue: the starting value for the `ObservableValue`.
     */
    constructor(path: string, model: gapi.drive.realtime.Model, initialValue?: JSONValue);
    /**
     * The observable type.
     */
    readonly type: 'Value';
    /**
     * The `gapi.drive.realtime.Model` associated with the value.
     */
    model: gapi.drive.realtime.Model;
    /**
     * Whether the value has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * The changed signal.
     */
    readonly changed: ISignal<this, ObservableValue.IChangedArgs>;
    /**
     * Get the current value.
     */
    get(): JSONValue | undefined;
    /**
     * Set the current value.
     *
     * @param value: the value to set.
     */
    set(value: JSONValue): void;
    /**
     * Dispose of the resources held by the value.
     */
    dispose(): void;
    private _path;
    private _isDisposed;
    private _model;
    private _changed;
    private _onValueChanged;
}
/**
 * Google Drive-based Model database that implements `IModelDB`.
 */
export declare class GoogleModelDB implements IModelDB {
    /**
     * Constructor for the database.
     */
    constructor(options: GoogleModelDB.ICreateOptions);
    /**
     * Whether the GoogleModelDB is collaborative.
     * Returns `true`.
     */
    readonly isCollaborative: boolean;
    /**
     * Get the CollaboratorMap.
     */
    readonly collaborators: CollaboratorMap;
    /**
     * Get the underlying `gapi.drive.realtime.Model`.
     */
    readonly model: gapi.drive.realtime.Model;
    /**
     * Get the underlying `gapi.drive.realtime.Document`.
     */
    readonly doc: gapi.drive.realtime.Document;
    /**
     * The base path for the `GoogleModelDB`. This is prepended
     * to all the paths that are passed in to the member
     * functions of the object.
     */
    readonly basePath: string;
    /**
     * Whether the model has been populated with
     * any model values.
     */
    readonly isPrepopulated: boolean;
    /**
     * A promise resolved when the `GoogleModelDB` has
     * connected to Google Drive.
     */
    readonly connected: Promise<void>;
    /**
     * Whether the database is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Get a value for a path.
     *
     * @param path: the path for the object.
     *
     * @returns an `IObservable`.
     */
    get(path: string): IObservable;
    /**
     * Get the object in the underlying `gapi.drive.realtime.CollaborativeMap`.
     * Not intended to be called by user code.
     *
     * @param path: the path for the object.
     */
    getGoogleObject(path: string): GoogleSynchronizable | undefined;
    /**
     * Whether the `GoogleModelDB` has an object at this path.
     *
     * @param path: the path for the object.
     *
     * @returns a boolean for whether an object is at `path`.
     */
    has(path: string): boolean;
    /**
     * Set a value at a path. Not intended to
     * be called by user code, instead use the
     * `create*` factory methods.
     *
     * @param path: the path to set the value at.
     *
     * @param value: the value to set at the path.
     */
    set(path: string, value: IGoogleRealtimeObject | GoogleObservableValue): void;
    /**
     * Create a string and insert it in the database.
     *
     * @param path: the path for the string.
     *
     * @returns the string that was created.
     */
    createString(path: string): IObservableString;
    /**
     * Create a list and insert it in the database.
     *
     * @param path: the path for the list.
     *
     * @returns the list that was created.
     *
     * #### Notes
     * The list can only store objects that are simple
     * JSON Objects and primitives.
     */
    createList<T extends JSONValue>(path: string): IObservableUndoableList<T>;
    /**
     * Create a map and insert it in the database.
     *
     * @param path: the path for the map.
     *
     * @returns the map that was created.
     *
     * #### Notes
     * The map can only store objects that are simple
     * JSON Objects and primitives.
     */
    createMap(path: string): IObservableJSON;
    /**
     * Create an opaque value and insert it in the database.
     *
     * @param path: the path for the value.
     *
     * @returns the value that was created.
     */
    createValue(path: string): IObservableValue;
    /**
     * Get a value at a path. That value must already have
     * been created using `createValue`.
     *
     * @param path: the path for the value.
     */
    getValue(path: string): JSONValue | undefined;
    /**
     * Set a value at a path. That value must already have
     * been created using `createValue`.
     *
     * @param path: the path for the value.
     *
     * @param value: the new value.
     */
    setValue(path: string, value: JSONValue): void;
    /**
     * Create a view onto a subtree of the model database.
     *
     * @param basePath: the path for the root of the subtree.
     *
     * @returns a `GoogleModelDB` with a view onto the original
     *   `GoogleModelDB`, with `basePath` prepended to all paths.
     */
    view(basePath: string): GoogleModelDB;
    /**
     * Dispose of the resources held by the database.
     */
    dispose(): void;
    /**
     * Compute the fully resolved path for a path argument.
     *
     * @param path: a path for the current view on the model.
     *
     * @returns a fully resolved path on the base model database.
     */
    fullPath(path: string): string;
    private _filePath;
    private _isDisposed;
    private _db;
    private _localDB;
    private _disposables;
    private _model;
    private _doc;
    private _basePath;
    private _baseDB;
    private _connected;
    private _isPrepopulated;
    private _collaborators;
}
/**
 * A namespace for the `GoogleModelDB` class statics.
 */
export declare namespace GoogleModelDB {
    /**
     * Options for creating a `ModelDB` object.
     */
    interface ICreateOptions {
        /**
         * The path for the location on Google Drive
         * to store the model.
         */
        filePath: string;
        /**
         * The base path to prepend to all the path arguments.
         */
        basePath?: string;
        /**
         * A `GoogleModelDB` to use as the store for this
         * `GoogleModelDB`. If none is given, it uses its own store.
         */
        baseDB?: GoogleModelDB;
        /**
         * A function to load a `gapi.drive.realtime.Document` given
         * a path. Meant only for testing purposes, and should not
         * be called by user code.
         */
        documentLoader?: (path: string) => Promise<gapi.drive.realtime.Document>;
    }
}
