/// <reference types="google-drive-realtime-api" />
import { ISignal } from '@phosphor/signaling';
import { IObservableString } from '@jupyterlab/observables';
import { IGoogleRealtimeObject } from './googlerealtime';
/**
 * Realtime string which wraps `gapi.drive.realtime.CollaborativeString`.
 */
export declare class GoogleString implements IObservableString, IGoogleRealtimeObject {
    /**
     * Constructor for the string.
     */
    constructor(str: gapi.drive.realtime.CollaborativeString);
    /**
     * The type of the Observable.
     */
    readonly type: 'String';
    /**
     * Set the value of the string.
     */
    /**
    * Get the value of the string.
    */
    text: string;
    /**
     * Get the underlying `gapi.drive.realtime.CollaborativeString`
     * for this string.
     */
    /**
    * Set the underlying `gapi.drive.realtime.CollaborativeString`
    * for this string.
    */
    googleObject: gapi.drive.realtime.CollaborativeString;
    /**
     * A signal emitted when the string has changed.
     */
    readonly changed: ISignal<this, IObservableString.IChangedArgs>;
    /**
     * Insert a substring.
     *
     * @param index - The starting index.
     *
     * @param text - The substring to insert.
     */
    insert(index: number, text: string): void;
    /**
     * Remove a substring.
     *
     * @param start - The starting index.
     *
     * @param end - The ending index.
     */
    remove(start: number, end: number): void;
    /**
     * Set the ObservableString to an empty string.
     */
    clear(): void;
    /**
     * Test whether the string has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the string.
     */
    dispose(): void;
    private _changed;
    private _str;
    private _isDisposed;
}
