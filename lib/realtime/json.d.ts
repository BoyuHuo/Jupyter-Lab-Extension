/// <reference types="google-drive-realtime-api" />
import { JSONObject, JSONValue } from '@phosphor/coreutils';
import { IObservableJSON } from '@jupyterlab/observables';
import { GoogleMap } from './map';
/**
 * A collaborative map for JSON data.
 */
export declare class GoogleJSON extends GoogleMap<JSONValue> implements IObservableJSON {
    /**
     * Constructor for a collaborative JSON object.
     */
    constructor(map: gapi.drive.realtime.CollaborativeMap<JSONValue>);
    /**
     * Serialize the model to JSON.
     */
    toJSON(): JSONObject;
}
