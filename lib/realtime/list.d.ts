/// <reference types="google-drive-realtime-api" />
import { IterableOrArrayLike, IIterator } from '@phosphor/algorithm';
import { ISignal } from '@phosphor/signaling';
import { IObservableList } from '@jupyterlab/observables';
import { IGoogleRealtimeObject, GoogleSynchronizable } from './googlerealtime';
/**
 * Realtime list type wrapping `gapi.drive.realtme.CollaborativeList`.
 */
export declare class GoogleList<T extends GoogleSynchronizable> implements IObservableList<T>, IGoogleRealtimeObject {
    /**
     * Create a new GoogleList.
     */
    constructor(list: gapi.drive.realtime.CollaborativeList<T>, itemCmp?: (first: T, second: T) => boolean);
    /**
     * The type of the Observable.
     */
    readonly type: 'List';
    /**
     * A signal emitted when the list has changed.
     */
    readonly changed: ISignal<this, IObservableList.IChangedArgs<T>>;
    /**
     * The length of the sequence.
     *
     * #### Notes
     * This is a read-only property.
     */
    readonly length: number;
    /**
     * Test whether the list is empty.
     *
     * @returns `true` if the list is empty, `false` otherwise.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * No changes.
     */
    readonly isEmpty: boolean;
    /**
     * Get the value at the front of the list.
     *
     * @returns The value at the front of the list, or `undefined` if
     *   the list is empty.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * No changes.
     */
    readonly front: T;
    /**
     * Get the value at the back of the list.
     *
     * @returns The value at the back of the list, or `undefined` if
     *   the list is empty.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * No changes.
     */
    readonly back: T;
    /**
     * Get the underlying `gapi.drive.CollaborativeList`
     * for this list.
     */
    /**
    * Set the underlying `gapi.drive.CollaborativeList` for this
    * list.
    */
    googleObject: gapi.drive.realtime.CollaborativeList<T>;
    /**
     * Create an iterator over the values in the list.
     *
     * @returns A new iterator starting at the front of the list.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * No changes.
     */
    iter(): IIterator<T>;
    /**
     * Get the value at the specified index.
     *
     * @param index - The positive integer index of interest.
     *
     * @returns The value at the specified index.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * No changes.
     *
     * #### Undefined Behavior
     * An `index` which is non-integral or out of range.
     */
    get(index: number): T;
    /**
     * Set the value at the specified index.
     *
     * @param index - The positive integer index of interest.
     *
     * @param value - The value to set at the specified index.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * No changes.
     *
     * #### Undefined Behavior
     * An `index` which is non-integral or out of range.
     */
    set(index: number, value: T): void;
    /**
     * Add a value to the back of the list.
     *
     * @param value - The value to add to the back of the list.
     *
     * @returns The new length of the list.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * No changes.
     */
    push(value: T): number;
    /**
     * Remove and return the value at the back of the list.
     *
     * @returns The value at the back of the list, or `undefined` if
     *   the list is empty.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * Iterators pointing at the removed value are invalidated.
     */
    popBack(): T;
    /**
     * Insert a value into the list at a specific index.
     *
     * @param index - The index at which to insert the value.
     *
     * @param value - The value to set at the specified index.
     *
     * @returns The new length of the list.
     *
     * #### Complexity
     * Linear.
     *
     * #### Iterator Validity
     * No changes.
     *
     * #### Notes
     * The `index` will be clamped to the bounds of the list.
     *
     * #### Undefined Behavior
     * An `index` which is non-integral.
     */
    insert(index: number, value: T): number;
    /**
     * Remove the first occurrence of a value from the list.
     *
     * @param value - The value of interest.
     *
     * @returns The index of the removed value, or `-1` if the value
     *   is not contained in the list.
     *
     * #### Complexity
     * Linear.
     *
     * #### Iterator Validity
     * Iterators pointing at the removed value and beyond are invalidated.
     *
     * #### Notes
     * Comparison is performed according to the itemCmp function,
     * which defaults to strict `===` equality.
     */
    removeValue(value: T): number;
    /**
     * Remove and return the value at a specific index.
     *
     * @param index - The index of the value of interest.
     *
     * @returns The value at the specified index, or `undefined` if the
     *   index is out of range.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * Iterators pointing at the removed value and beyond are invalidated.
     *
     * #### Undefined Behavior
     * An `index` which is non-integral.
     */
    remove(index: number): T | undefined;
    /**
     * Remove all values from the list.
     *
     * #### Complexity
     * Linear.
     *
     * #### Iterator Validity
     * All current iterators are invalidated.
     */
    clear(): void;
    /**
     * Move a value from one index to another.
     *
     * @parm fromIndex - The index of the element to move.
     *
     * @param toIndex - The index to move the element to.
     *
     * #### Complexity
     * Constant.
     *
     * #### Iterator Validity
     * Iterators pointing at the lesser of the `fromIndex` and the `toIndex`
     * and beyond are invalidated.
     *
     * #### Undefined Behavior
     * A `fromIndex` or a `toIndex` which is non-integral.
     */
    move(fromIndex: number, toIndex: number): void;
    /**
     * Push a set of values to the back of the list.
     *
     * @param values - An iterable or array-like set of values to add.
     *
     * @returns The new length of the list.
     *
     * #### Complexity
     * Linear.
     *
     * #### Iterator Validity
     * No changes.
     */
    pushAll(values: IterableOrArrayLike<T>): number;
    /**
     * Insert a set of items into the list at the specified index.
     *
     * @param index - The index at which to insert the values.
     *
     * @param values - The values to insert at the specified index.
     *
     * @returns The new length of the list.
     *
     * #### Complexity.
     * Linear.
     *
     * #### Iterator Validity
     * No changes.
     *
     * #### Notes
     * The `index` will be clamped to the bounds of the list.
     *
     * #### Undefined Behavior.
     * An `index` which is non-integral.
     */
    insertAll(index: number, values: IterableOrArrayLike<T>): number;
    /**
     * Remove a range of items from the list.
     *
     * @param startIndex - The start index of the range to remove (inclusive).
     *
     * @param endIndex - The end index of the range to remove (exclusive).
     *
     * @returns The new length of the list.
     *
     * #### Complexity
     * Linear.
     *
     * #### Iterator Validity
     * Iterators pointing to the first removed value and beyond are invalid.
     *
     * #### Undefined Behavior
     * A `startIndex` or `endIndex` which is non-integral.
     */
    removeRange(startIndex: number, endIndex: number): number;
    /**
     * Test whether the string has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the list.
     */
    dispose(): void;
    private _vec;
    private _changed;
    private _itemCmp;
    private _isDisposed;
}
