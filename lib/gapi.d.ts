/// <reference types="gapi" />
/// <reference types="gapi.auth2" />
/// <reference types="google-drive-realtime-api" />
import { PromiseDelegate } from '@phosphor/coreutils';
import { ServerConnection } from '@jupyterlab/services';
/**
 * Default Client ID to let the Google Servers know who
 * we are. These can be changed to ones linked to a particular
 * user if they so desire.
 */
export declare const DEFAULT_CLIENT_ID = "625147942732-t30t8vnn43fl5mvg1qde5pl84603dr6s.apps.googleusercontent.com";
/**
 * A promise delegate that is resolved when the google client
 * libraries are loaded onto the page.
 */
export declare const gapiLoaded: PromiseDelegate<void>;
/**
 * A promise delegate that is resolved when the gapi client
 * libraries are initialized.
 */
export declare const gapiInitialized: PromiseDelegate<void>;
/**
 * A promise delegate that is resolved when the user authorizes
 * the app to access their Drive account.
 *
 * #### Notes
 * This promise will be reassigned if the user logs out.
 */
export declare let gapiAuthorized: PromiseDelegate<void>;
/**
 * A boolean that is set if the deprecated realtime APIs
 * have been loaded onto the page.
 */
export declare let realtimeLoaded: boolean;
/**
 * Load the gapi scripts onto the page.
 *
 * @param realtime - whether to load the (deprecated) realtime libraries.
 *
 * @returns a promise that resolves when the gapi scripts are loaded.
 */
export declare function loadGapi(realtime: boolean): Promise<void>;
/**
 * Initialize the gapi client libraries.
 *
 * @param clientId: The client ID for the project from the
 *   Google Developer Console. If not given, defaults to
 *   a testing project client ID. However, if you are deploying
 *   your own Jupyter server, or are making heavy use of the
 *   API, it is probably a good idea to set up your own client ID.
 *
 * @returns a promise that resolves when the client libraries are loaded.
 *   The return value of the promise is a boolean indicating whether
 *   the user was automatically signed in by the initialization.
 */
export declare function initializeGapi(clientId: string): Promise<boolean>;
/**
 * Wrapper function for making API requests to Google Drive.
 *
 * @param createRequest: a function that creates a request object for
 *   the Google Drive APIs. This is typically created by the Javascript
 *   client library. We use a request factory to create additional requests
 *   should we need to try exponential backoff.
 *
 * @param successCode: the code to check against for success of the request, defaults
 *   to 200.
 *
 * @param attemptNumber: the number of times this request has been made
 *   (used when attempting exponential backoff).
 *
 * @returns a promse that resolves with the result of the request.
 */
export declare function driveApiRequest<T>(createRequest: () => gapi.client.HttpRequest<T>, successCode?: number, attemptNumber?: number): Promise<T>;
/**
 * Ask the user for permission to use their Google Drive account.
 * First it tries to authorize without a popup, and if it fails, it
 * creates a popup. If the argument `allowPopup` is false, then it will
 * not try to authorize with a popup.
 *
 * @returns: a promise that resolves with a boolean for whether permission
 *   has been granted.
 */
export declare function signIn(): Promise<boolean>;
/**
 * Sign a user out of their Google account.
 *
 * @returns a promise resolved when sign-out is complete.
 */
export declare function signOut(): Promise<void>;
/**
 * Get the basic profile of the currently signed-in user.
 *
 * @returns a `gapi.auth2.BasicProfile instance.
 */
export declare function getCurrentUserProfile(): gapi.auth2.BasicProfile;
/**
 * Wrap an API error in a hacked-together error object
 * masquerading as an `ServerConnection.ResponseError`.
 */
export declare function makeError(code: number, message: string): ServerConnection.ResponseError;
/**
 * Handle an error thrown by a realtime file,
 * if possible.
 *
 * @param err - the realtime error.
 */
export declare function handleRealtimeError(err: gapi.drive.realtime.Error): void;
