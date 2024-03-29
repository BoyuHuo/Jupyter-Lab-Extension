/// <reference types="google-drive-realtime-api" />
import { JSONValue } from '@phosphor/coreutils';
/**
 * An base class for wrappers around collaborative strings,
 * maps, and lists.
 */
export interface IGoogleRealtimeObject {
    readonly type: 'String' | 'Map' | 'List';
    /**
     * Access to the underlying collaborative object.
     */
    readonly googleObject: gapi.drive.realtime.CollaborativeObject;
}
/**
 * A type alias for the types of objects which may be inserted into
 * a Google Realtime Map/List and function correctly. More complex
 * models/objects will not work, and must be converted to/from one
 * of these types before insertion.
 */
export declare type GoogleSynchronizable = JSONValue | gapi.drive.realtime.CollaborativeObject;
