/// <reference path="../../src/drive/gapi.client.drive.d.ts" />
/// <reference types="google-drive-realtime-api" />
import { Contents } from '@jupyterlab/services';
import { DocumentRegistry } from '@jupyterlab/docregistry';
export declare const RT_MIMETYPE = "application/vnd.google-apps.drive-sdk";
export declare const FOLDER_MIMETYPE = "application/vnd.google-apps.folder";
export declare const FILE_MIMETYPE = "application/vnd.google-apps.file";
/**
 * Type alias for a files resource returned by
 * the Google Drive API.
 */
export declare type FileResource = gapi.client.drive.File;
/**
 * Type alias for a Google Drive revision resource.
 */
export declare type RevisionResource = gapi.client.drive.Revision;
/**
 * Type stub for a Team Drive resource.
 */
export declare type TeamDriveResource = gapi.client.drive.TeamDrive;
/**
 * Get a download URL for a file path.
 *
 * @param path - the path corresponding to the file.
 *
 * @returns a promise that resolves with the download URL.
 */
export declare function urlForFile(path: string): Promise<string>;
/**
 * Given a path and `Contents.IModel`, upload the contents to Google Drive.
 *
 * @param path - the path to which to upload the contents.
 *
 * @param model - the `Contents.IModel` to upload.
 *
 * @param fileType - a candidate DocumentRegistry.IFileType for the given file.
 *
 * @param exisiting - whether the file exists.
 *
 * @returns a promise fulfulled with the `Contents.IModel` that has been uploaded,
 *   or throws an Error if it fails.
 */
export declare function uploadFile(path: string, model: Partial<Contents.IModel>, fileType: DocumentRegistry.IFileType, existing?: boolean, fileTypeForPath?: ((path: string) => DocumentRegistry.IFileType) | undefined): Promise<Contents.IModel>;
/**
 * Given a files resource, construct a Contents.IModel.
 *
 * @param resource - the files resource.
 *
 * @param path - the path at which the resource exists in the filesystem.
 *   This should include the name of the file itself.
 *
 * @param fileType - a candidate DocumentRegistry.IFileType for the given file.
 *
 * @param includeContents - whether to download the actual text/json/binary
 *   content from the server. This takes much more bandwidth, so should only
 *   be used when required.
 *
 * @param fileTypeForPath - A function that, given a path argument, returns
 *   and DocumentRegistry.IFileType that is consistent with the path.
 *
 * @returns a promise fulfilled with the Contents.IModel for the resource.
 */
export declare function contentsModelFromFileResource(resource: FileResource, path: string, fileType: DocumentRegistry.IFileType, includeContents: boolean, fileTypeForPath?: ((path: string) => DocumentRegistry.IFileType) | undefined): Promise<Contents.IModel>;
/**
 * Given a path, get a `Contents.IModel` corresponding to that file.
 *
 * @param path - the path of the file.
 *
 * @param includeContents - whether to include the binary/text/contents of the file.
 *   If false, just get the metadata.
 *
 * @param fileTypeForPath - A function that, given a path argument, returns
 *   and DocumentRegistry.IFileType that is consistent with the path.
 *
 * @returns a promise fulfilled with the `Contents.IModel` of the appropriate file.
 *   Otherwise, throws an error.
 */
export declare function contentsModelForPath(path: string, includeContents: boolean, fileTypeForPath: (path: string) => DocumentRegistry.IFileType): Promise<Contents.IModel>;
/**
 * Give edit permissions to a Google drive user.
 *
 * @param resource: the FileResource to share.
 *
 * @param emailAddresses - the email addresses of the users for which
 *   to create the permissions.
 *
 * @returns a promise fulfilled when the permissions are created.
 */
export declare function createPermissions(resource: FileResource, emailAddresses: string[]): Promise<void>;
/**
 * Create a new document for realtime collaboration.
 * This file is not associated with a particular filetype,
 * and is not downloadable/readable.  Realtime documents
 * may also be associated with other, more readable documents.
 *
 * @returns a promise fulfilled with the fileId of the
 *   newly-created realtime document.
 */
export declare function createRealtimeDocument(): Promise<string>;
/**
 * Load the realtime document associated with a file.
 *
 * @param fileId - the ID of the realtime file on Google Drive.
 *
 * @returns a promise fulfilled with the realtime document model.
 */
export declare function loadRealtimeDocument(resource: FileResource, picked?: boolean): Promise<gapi.drive.realtime.Document>;
/**
 * Delete a file from the users Google Drive.
 *
 * @param path - the path of the file to delete.
 *
 * @returns a promise fulfilled when the file has been deleted.
 */
export declare function deleteFile(path: string): Promise<void>;
/**
 * Search a directory.
 *
 * @param path - the path of the directory on the server.
 *
 * @param query - a query string, following the format of
 *   query strings for the Google Drive v3 API, which
 *   narrows down search results. An empty query string
 *   corresponds to just listing the contents of the directory.
 *
 * @returns a promise fulfilled with a list of files resources,
 *   corresponding to the files that are in the directory and
 *   match the query string.
 */
export declare function searchDirectory(path: string, query?: string): Promise<FileResource[]>;
/**
 * Search the list of files that have been shared with the user.
 *
 * @param query - a query string, following the format of
 *   query strings for the Google Drive v3 API, which
 *   narrows down search results. An empty query string
 *   corresponds to just listing the shared files.
 *
 * @returns a promise fulfilled with the files that have been
 * shared with the user.
 *
 * ### Notes
 * This does not search Team Drives.
 */
export declare function searchSharedFiles(query?: string): Promise<FileResource[]>;
/**
 * Move a file in Google Drive. Can also be used to rename the file.
 *
 * @param oldPath - The initial location of the file (where the path
 *   includes the filename).
 *
 * @param newPath - The new location of the file (where the path
 *   includes the filename).
 *
 * @param fileTypeForPath - A function that, given a path argument, returns
 *   and DocumentRegistry.IFileType that is consistent with the path.
 *
 * @returns a promise fulfilled with the `Contents.IModel` of the moved file.
 *   Otherwise, throws an error.
 */
export declare function moveFile(oldPath: string, newPath: string, fileTypeForPath: (path: string) => DocumentRegistry.IFileType): Promise<Contents.IModel>;
/**
 * Copy a file in Google Drive. It is assumed that the new filename has
 * been determined previous to invoking this function, and does not conflict
 * with any files in the new directory.
 *
 * @param oldPath - The initial location of the file (where the path
 *   includes the filename).
 *
 * @param newPath - The location of the copy (where the path
 *   includes the filename). This cannot be the same as `oldPath`.
 *
 * @param fileTypeForPath - A function that, given a path argument, returns
 *   and DocumentRegistry.IFileType that is consistent with the path.
 *
 * @returns a promise fulfilled with the `Contents.IModel` of the copy.
 *   Otherwise, throws an error.
 */
export declare function copyFile(oldPath: string, newPath: string, fileTypeForPath: (path: string) => DocumentRegistry.IFileType): Promise<Contents.IModel>;
/**
 * Invalidate the resource cache.
 *
 * #### Notes
 * The resource cache is mostly private to this module, and
 * is essential to not be rate-limited by Google.
 *
 * This should only be called when the user signs out, and
 * the cached information about their directory structure
 * is no longer valid.
 */
export declare function clearCache(): void;
/**
 * List the revisions for a file in Google Drive.
 *
 * @param path - the path of the file.
 *
 * @returns a promise fulfilled with a list of `Contents.ICheckpointModel`
 *   that correspond to the file revisions stored on drive.
 */
export declare function listRevisions(path: string): Promise<Contents.ICheckpointModel[]>;
/**
 * Tell Google drive to keep the current revision. Without doing
 * this the revision would eventually be cleaned up.
 *
 * @param path - the path of the file to pin.
 *
 * @returns a promise fulfilled with an `ICheckpointModel` corresponding
 *   to the newly pinned revision.
 */
export declare function pinCurrentRevision(path: string): Promise<Contents.ICheckpointModel>;
/**
 * Tell Google drive not to keep the current revision.
 * Eventually the revision will then be cleaned up.
 *
 * @param path - the path of the file to unpin.
 *
 * @param revisionId - the id of the revision to unpin.
 *
 * @returns a promise fulfilled when the revision is unpinned.
 */
export declare function unpinRevision(path: string, revisionId: string): Promise<void>;
/**
 * Revert a file to a particular revision id.
 *
 * @param path - the path of the file.
 *
 * @param revisionId - the id of the revision to revert.
 *
 * @param fileType - a candidate DocumentRegistry.IFileType for the given file.
 *
 * @returns a promise fulfilled when the file is reverted.
 */
export declare function revertToRevision(path: string, revisionId: string, fileType: DocumentRegistry.IFileType): Promise<void>;
/**
 * Whether a path is a dummy directory.
 */
export declare function isDummy(path: string): boolean;
/**
 * Whether a resource is a directory (or Team Drive),
 * which may contain items.
 */
export declare function isDirectory(resource: FileResource): boolean;
/**
 * Gets the Google Drive Files resource corresponding to a path.  The path
 * is always treated as an absolute path, no matter whether it contains
 * leading or trailing slashes.  In fact, all leading, trailing and
 * consecutive slashes are ignored.
 *
 * @param path - The path of the file.
 *
 * @param type - The type (file or folder)
 *
 * @returns A promise fulfilled with the files resource for the given path.
 *   or an Error object on error.
 */
export declare function getResourceForPath(path: string): Promise<FileResource>;
