/// <reference types="google-drive-realtime-api" />
import { ISignal } from '@phosphor/signaling';
import { IObservableMap } from '@jupyterlab/observables';
import { IGoogleRealtimeObject, GoogleSynchronizable } from './googlerealtime';
/**
 * Realtime map which wraps `gapi.drive.realtime.CollaborativeMap`
 */
export declare class GoogleMap<T extends GoogleSynchronizable> implements IObservableMap<T>, IGoogleRealtimeObject {
    /**
     * Constructor
     */
    constructor(map: gapi.drive.realtime.CollaborativeMap<T>, itemCmp?: (first: T, second: T) => boolean);
    /**
     * The type of the Observable.
     */
    readonly type: 'Map';
    /**
     * A signal emitted when the map has changed.
     */
    readonly changed: ISignal<this, IObservableMap.IChangedArgs<T>>;
    /**
     * The number of key-value pairs in the map.
     */
    readonly size: number;
    /**
     * Whether this map has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Get the underlying `gapi.drive.realtime.CollaborativeMap`
     * for this map.
     */
    /**
    * Set the underlying `gapi.drive.realtime.CollaborativeMap`
    * for this object.
    */
    googleObject: gapi.drive.realtime.CollaborativeMap<T>;
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
    set(key: string, value: T): T | undefined;
    /**
     * Get a value for a given key.
     *
     * @param key - the key.
     *
     * @returns the value for that key.
     */
    get(key: string): T | undefined;
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
    values(): T[];
    /**
     * Remove a key from the map
     *
     * @param key - the key to remove.
     *
     * @returns the value of the given key,
     *   or undefined if that does not exist.
     */
    delete(key: string): T | undefined;
    /**
     * Set the ObservableMap to an empty map.
     */
    clear(): void;
    /**
     * Dispose of the resources held by the map.
     */
    dispose(): void;
    private _changed;
    private _map;
    private _itemCmp;
    private _isDisposed;
}
