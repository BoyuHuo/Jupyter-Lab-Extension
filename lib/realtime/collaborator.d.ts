/// <reference types="google-drive-realtime-api" />
import { ISignal } from '@phosphor/signaling';
import { ICollaborator, IObservableMap } from '@jupyterlab/observables';
export declare class CollaboratorMap implements IObservableMap<ICollaborator> {
    constructor(doc: gapi.drive.realtime.Document);
    /**
     * The type of the Observable.
     */
    readonly type: 'Map';
    /**
     * The number of key-value pairs in the map.
     */
    readonly size: number;
    /**
     * A signal emitted when the map has changed.
     */
    readonly changed: ISignal<this, IObservableMap.IChangedArgs<ICollaborator>>;
    /**
     * Whether this map has been disposed.
     */
    readonly isDisposed: boolean;
    readonly localCollaborator: ICollaborator;
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
    set(key: string, value: ICollaborator): ICollaborator | undefined;
    /**
     * Get a value for a given key.
     *
     * @param key - the key.
     *
     * @returns the value for that key.
     */
    get(key: string): ICollaborator | undefined;
    /**
     * Check whether the map has a key.
     *
     * @param key - the key to check.
     *
     * @returns `true` if the map has the key, `false` otherwise.
     */
    has(key: string): boolean;
    /**
     * Get a list of the keys in the map.
     *
     * @returns - a list of keys.
     */
    keys(): string[];
    /**
     * Get a list of the values in the map.
     *
     * @returns - a list of values.
     */
    values(): ICollaborator[];
    /**
     * Remove a key from the map
     *
     * @param key - the key to remove.
     *
     * @returns the value of the given key,
     *   or undefined if that does not exist.
     */
    delete(key: string): ICollaborator | undefined;
    /**
     * Set the CollaboratorMap to an empty map.
     */
    clear(): void;
    /**
     * Dispose of the resources held by the map.
     */
    dispose(): void;
    private _localCollaborator;
    private _doc;
    private _map;
    private _isDisposed;
    private _changed;
}
