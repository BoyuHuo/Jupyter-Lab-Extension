"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line
/// <reference path="./gapi.client.drive.d.ts" />
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@jupyterlab/coreutils");
const docregistry_1 = require("@jupyterlab/docregistry");
const gapi_1 = require("../gapi");
/**
 * Fields to request for File resources.
 */
const RESOURCE_FIELDS = 'kind,id,name,mimeType,trashed,headRevisionId,' +
    'parents,modifiedTime,createdTime,capabilities,' +
    'webContentLink,teamDriveId';
/**
 * Fields to request for Team Drive resources.
 */
const TEAMDRIVE_FIELDS = 'kind,id,name,capabilities';
/**
 * Fields to request for Revision resources.
 */
const REVISION_FIELDS = 'id, modifiedTime, keepForever';
/**
 * Fields to request for File listings.
 */
const FILE_LIST_FIELDS = 'nextPageToken';
/**
 * Fields to reuest for Team Drive listings.
 */
const TEAMDRIVE_LIST_FIELDS = 'nextPageToken';
/**
 * Fields to reuest for Team Drive listings.
 */
const REVISION_LIST_FIELDS = 'nextPageToken';
/**
 * Page size for file listing (max allowable).
 */
const FILE_PAGE_SIZE = 1000;
/**
 * Page size for team drive listing (max allowable).
 */
const TEAMDRIVE_PAGE_SIZE = 100;
/**
 * Page size for revision listing (max allowable).
 */
const REVISION_PAGE_SIZE = 1000;
exports.RT_MIMETYPE = 'application/vnd.google-apps.drive-sdk';
exports.FOLDER_MIMETYPE = 'application/vnd.google-apps.folder';
exports.FILE_MIMETYPE = 'application/vnd.google-apps.file';
const MULTIPART_BOUNDARY = '-------314159265358979323846';
/**
 * Alias for directory IFileType.
 */
const directoryFileType = docregistry_1.DocumentRegistry.defaultDirectoryFileType;
/**
 * The name of the dummy "Shared with me" folder.
 */
const SHARED_DIRECTORY = 'Shared with me';
/**
 * The path of the dummy pseudo-root folder.
 */
const COLLECTIONS_DIRECTORY = '';
/**
 * A dummy files resource for the "Shared with me" folder.
 */
const SHARED_DIRECTORY_RESOURCE = {
    kind: 'dummy',
    name: SHARED_DIRECTORY
};
/**
 * A dummy files resource for the pseudo-root folder.
 */
const COLLECTIONS_DIRECTORY_RESOURCE = {
    kind: 'dummy',
    name: ''
};
/* ****** Functions for uploading/downloading files ******** */
/**
 * Get a download URL for a file path.
 *
 * @param path - the path corresponding to the file.
 *
 * @returns a promise that resolves with the download URL.
 */
function urlForFile(path) {
    return getResourceForPath(path).then((resource) => {
        return resource.webContentLink;
    });
}
exports.urlForFile = urlForFile;
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
function uploadFile(path, model, fileType, existing = false, fileTypeForPath = undefined) {
    if (isDummy(coreutils_1.PathExt.dirname(path)) && !existing) {
        throw gapi_1.makeError(400, `Google Drive: "${path}"` + ' is not a valid save directory');
    }
    let resourceReadyPromise;
    if (existing) {
        resourceReadyPromise = getResourceForPath(path);
    }
    else {
        resourceReadyPromise = new Promise((resolve, reject) => {
            let enclosingFolderPath = coreutils_1.PathExt.dirname(path);
            const resource = fileResourceFromContentsModel(model, fileType);
            getResourceForPath(enclosingFolderPath).then((parentFolderResource) => {
                if (!isDirectory(parentFolderResource)) {
                    throw new Error('Google Drive: expected a folder: ' + path);
                }
                if (parentFolderResource.kind === 'drive#teamDrive') {
                    resource.teamDriveId = parentFolderResource.id;
                }
                else if (parentFolderResource.teamDriveId) {
                    resource.teamDriveId = parentFolderResource.teamDriveId;
                }
                resource.parents = [parentFolderResource.id];
                resolve(resource);
            });
        });
    }
    return resourceReadyPromise
        .then((resource) => {
        // Construct the HTTP request: first the metadata,
        // then the content of the uploaded file.
        const delimiter = '\r\n--' + MULTIPART_BOUNDARY + '\r\n';
        const closeDelim = '\r\n--' + MULTIPART_BOUNDARY + '--';
        // Metatdata part.
        let body = delimiter + 'Content-Type: application/json\r\n\r\n';
        // Don't update metadata if the file already exists.
        if (!existing) {
            body += JSON.stringify(resource);
        }
        body += delimiter;
        // Content of the file.
        body += 'Content-Type: ' + resource.mimeType + '\r\n';
        // It is not well documented, but as can be seen in
        // filebrowser/src/model.ts, anything that is not a
        // notebook is a base64 encoded string.
        if (model.format === 'base64') {
            body += 'Content-Transfer-Encoding: base64\r\n';
            body += '\r\n' + model.content + closeDelim;
        }
        else if (model.format === 'text') {
            // If it is already a text string, just send that.
            body += '\r\n' + model.content + closeDelim;
        }
        else {
            // Notebook case.
            body += '\r\n' + JSON.stringify(model.content) + closeDelim;
        }
        let apiPath = '/upload/drive/v3/files';
        let method = 'POST';
        if (existing) {
            method = 'PATCH';
            apiPath = apiPath + '/' + resource.id;
        }
        const createRequest = () => {
            return gapi.client.request({
                path: apiPath,
                method: method,
                params: {
                    uploadType: 'multipart',
                    supportsTeamDrives: !!resource.teamDriveId,
                    fields: RESOURCE_FIELDS
                },
                headers: {
                    'Content-Type': 'multipart/related; boundary="' + MULTIPART_BOUNDARY + '"'
                },
                body: body
            });
        };
        return gapi_1.driveApiRequest(createRequest);
    })
        .then(result => {
        // Update the cache.
        Private.resourceCache.set(path, result);
        return contentsModelFromFileResource(result, path, fileType, true, fileTypeForPath);
    });
}
exports.uploadFile = uploadFile;
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
function contentsModelFromFileResource(resource, path, fileType, includeContents, fileTypeForPath = undefined) {
    // Handle the exception of the dummy directories
    if (resource.kind === 'dummy') {
        return contentsModelFromDummyFileResource(resource, path, includeContents, fileTypeForPath);
    }
    // Handle the case of getting the contents of a directory.
    if (isDirectory(resource)) {
        // Enter contents metadata.
        const contents = {
            name: resource.name,
            path: path,
            type: 'directory',
            writable: resource.capabilities.canEdit || true,
            created: resource.createdTime || '',
            last_modified: resource.modifiedTime || '',
            mimetype: fileType.mimeTypes[0],
            content: null,
            format: 'json'
        };
        // Get directory listing if applicable.
        if (includeContents) {
            if (!fileTypeForPath) {
                throw Error('Must include fileTypeForPath argument to get directory listing');
            }
            const fileList = [];
            return searchDirectory(path)
                .then((resources) => {
                // Update the cache.
                Private.clearCacheForDirectory(path);
                Private.populateCacheForDirectory(path, resources);
                let currentContents = Promise.resolve({});
                for (let i = 0; i < resources.length; i++) {
                    const currentResource = resources[i];
                    const resourcePath = path
                        ? path + '/' + currentResource.name
                        : currentResource.name;
                    const resourceFileType = fileTypeForPath(resourcePath);
                    currentContents = contentsModelFromFileResource(currentResource, resourcePath, resourceFileType, false);
                    currentContents.then((contents) => {
                        fileList.push(contents);
                    });
                }
                return currentContents;
            })
                .then(() => {
                return Object.assign({}, contents, { content: fileList });
            });
        }
        else {
            return Promise.resolve(contents);
        }
    }
    else {
        // Handle the case of getting the contents of a file.
        const contents = {
            name: resource.name,
            path: path,
            type: fileType.contentType,
            writable: resource.capabilities.canEdit || true,
            created: resource.createdTime || '',
            last_modified: resource.modifiedTime || '',
            mimetype: fileType.mimeTypes[0],
            content: null,
            format: fileType.fileFormat
        };
        // Download the contents from the server if necessary.
        if (includeContents) {
            return downloadResource(resource).then((result) => {
                let content = result;
                if (contents.format === 'base64') {
                    content = btoa(result);
                }
                else if (resource.mimeType === 'application/json') {
                    content = JSON.stringify(result, null, 2);
                }
                return Object.assign({}, contents, { content });
            });
        }
        else {
            return Promise.resolve(contents);
        }
    }
}
exports.contentsModelFromFileResource = contentsModelFromFileResource;
/**
 * There are two fake directories that we expose in the file browser
 * in order to have access to the "Shared with me" directory. This is
 * not a proper directory in the Google Drive system, just a collection
 * of files that have a `sharedWithMe` flag, so we have to treat it
 * separately. This constructs Contents.IModels from our dummy directories.
 *
 * @param resource: the dummy files resource.
 *
 * @param path: the path for the dummy resource.
 *
 * @param includeContents: whether to include the directory listing
 *   for the dummy directory.
 *
 * @param fileTypeForPath - A function that, given a path argument, returns
 *   and DocumentRegistry.IFileType that is consistent with the path.
 *
 * @returns a promise fulfilled with the a Contents.IModel for the resource.
 */
function contentsModelFromDummyFileResource(resource, path, includeContents, fileTypeForPath) {
    // Construct the empty Contents.IModel.
    const contents = {
        name: resource.name,
        path: path,
        type: 'directory',
        writable: false,
        created: '',
        last_modified: '',
        content: null,
        mimetype: '',
        format: 'json'
    };
    if (includeContents && !fileTypeForPath) {
        throw Error('Must include fileTypeForPath argument to get directory listing');
    }
    if (resource.name === SHARED_DIRECTORY && includeContents) {
        // If `resource` is the SHARED_DIRECTORY_RESOURCE, and we
        // need the file listing for it, then get them.
        const fileList = [];
        return searchSharedFiles()
            .then((resources) => {
            // Update the cache.
            Private.clearCacheForDirectory(path);
            Private.populateCacheForDirectory(path, resources);
            let currentContents = Promise.resolve({});
            for (let i = 0; i < resources.length; i++) {
                const currentResource = resources[i];
                const resourcePath = path
                    ? path + '/' + currentResource.name
                    : currentResource.name;
                const resourceFileType = fileTypeForPath(resourcePath);
                currentContents = contentsModelFromFileResource(currentResource, resourcePath, resourceFileType, false, fileTypeForPath);
                currentContents.then((contents) => {
                    fileList.push(contents);
                });
            }
            return currentContents;
        })
            .then(() => {
            const content = fileList;
            return Object.assign({}, contents, { content });
        });
    }
    else if (resource.name === COLLECTIONS_DIRECTORY && includeContents) {
        // If `resource` is the pseudo-root directory, construct
        // a contents model for it.
        const sharedContentsPromise = contentsModelFromFileResource(SHARED_DIRECTORY_RESOURCE, SHARED_DIRECTORY, directoryFileType, false, undefined);
        const rootContentsPromise = resourceFromFileId('root').then(rootResource => {
            return contentsModelFromFileResource(rootResource, rootResource.name || '', directoryFileType, false, undefined);
        });
        const teamDrivesContentsPromise = listTeamDrives().then(drives => {
            const drivePromises = [];
            for (let drive of drives) {
                drivePromises.push(contentsModelFromFileResource(drive, drive.name, directoryFileType, false, undefined));
            }
            return Promise.all(drivePromises);
        });
        return Promise.all([
            rootContentsPromise,
            sharedContentsPromise,
            teamDrivesContentsPromise
        ]).then(c => {
            const rootItems = c[2];
            rootItems.unshift(c[1]);
            rootItems.unshift(c[0]);
            return Object.assign({}, contents, { content: rootItems });
        });
    }
    else {
        // Otherwise return the (mostly) empty contents model.
        return Promise.resolve(contents);
    }
}
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
function contentsModelForPath(path, includeContents, fileTypeForPath) {
    const fileType = fileTypeForPath(path);
    return getResourceForPath(path).then((resource) => {
        return contentsModelFromFileResource(resource, path, fileType, includeContents, fileTypeForPath);
    });
}
exports.contentsModelForPath = contentsModelForPath;
/* ********* Functions for file creation/deletion ************** */
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
function createPermissions(resource, emailAddresses) {
    // Do nothing for an empty list.
    if (emailAddresses.length === 0) {
        return Promise.resolve(void 0);
    }
    const createRequest = () => {
        // Create a batch request for permissions.
        // Note: the typings for gapi.client are missing
        // the newBatch() function, which creates an HttpBatchRequest
        const batch = gapi.client.newBatch();
        for (let address of emailAddresses) {
            const permissionRequest = {
                type: 'user',
                role: 'writer',
                emailAddress: address
            };
            const request = gapi.client.drive.permissions.create({
                fileId: resource.id,
                emailMessage: `${resource.name} has been shared with you`,
                sendNotificationEmail: true,
                resource: permissionRequest,
                supportsTeamDrives: !!resource.teamDriveId
            });
            batch.add(request);
        }
        return batch;
    };
    // Submit the batch request.
    return gapi_1.driveApiRequest(createRequest).then(() => {
        return void 0;
    });
}
exports.createPermissions = createPermissions;
/**
 * Create a new document for realtime collaboration.
 * This file is not associated with a particular filetype,
 * and is not downloadable/readable.  Realtime documents
 * may also be associated with other, more readable documents.
 *
 * @returns a promise fulfilled with the fileId of the
 *   newly-created realtime document.
 */
function createRealtimeDocument() {
    const createRequest = () => {
        return gapi.client.drive.files.create({
            resource: {
                mimeType: exports.RT_MIMETYPE,
                name: 'jupyterlab_realtime_file'
            }
        });
    };
    return gapi_1.driveApiRequest(createRequest).then(result => {
        return result.id;
    });
}
exports.createRealtimeDocument = createRealtimeDocument;
/**
 * Load the realtime document associated with a file.
 *
 * @param fileId - the ID of the realtime file on Google Drive.
 *
 * @returns a promise fulfilled with the realtime document model.
 */
function loadRealtimeDocument(resource, picked = false) {
    return new Promise((resolve, reject) => {
        gapi_1.gapiAuthorized.promise.then(() => {
            gapi.drive.realtime.load(resource.id, (doc) => {
                resolve(doc);
            }, (model) => {
                /* no-op initializer */
            }, gapi_1.handleRealtimeError);
        });
    });
}
exports.loadRealtimeDocument = loadRealtimeDocument;
/**
 * Delete a file from the users Google Drive.
 *
 * @param path - the path of the file to delete.
 *
 * @returns a promise fulfilled when the file has been deleted.
 */
function deleteFile(path) {
    return getResourceForPath(path)
        .then((resource) => {
        const createRequest = () => {
            return gapi.client.drive.files.delete({
                fileId: resource.id,
                supportsTeamDrives: !!resource.teamDriveId
            });
        };
        return gapi_1.driveApiRequest(createRequest, 204);
    })
        .then(() => {
        // Update the cache
        Private.resourceCache.delete(path);
        return void 0;
    });
}
exports.deleteFile = deleteFile;
/* ****** Functions for file system querying/manipulation ***** */
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
function searchDirectory(path, query = '') {
    return getResourceForPath(path).then((resource) => {
        // Check to make sure this is a folder.
        if (!isDirectory(resource)) {
            throw new Error('Google Drive: expected a folder: ' + path);
        }
        // Construct the query.
        let fullQuery = `\'${resource.id}\' in parents ` + 'and trashed = false';
        if (query) {
            fullQuery += ' and ' + query;
        }
        const getPage = (pageToken) => {
            let createRequest;
            if (resource.teamDriveId) {
                // Case of a directory in a team drive.
                createRequest = () => {
                    return gapi.client.drive.files.list({
                        q: fullQuery,
                        pageSize: FILE_PAGE_SIZE,
                        pageToken,
                        fields: `${FILE_LIST_FIELDS}, files(${RESOURCE_FIELDS})`,
                        corpora: 'teamDrive',
                        includeTeamDriveItems: true,
                        supportsTeamDrives: true,
                        teamDriveId: resource.teamDriveId
                    });
                };
            }
            else if (resource.kind === 'drive#teamDrive') {
                // Case of the root of a team drive.
                createRequest = () => {
                    return gapi.client.drive.files.list({
                        q: fullQuery,
                        pageSize: FILE_PAGE_SIZE,
                        pageToken,
                        fields: `${FILE_LIST_FIELDS}, files(${RESOURCE_FIELDS})`,
                        corpora: 'teamDrive',
                        includeTeamDriveItems: true,
                        supportsTeamDrives: true,
                        teamDriveId: resource.id
                    });
                };
            }
            else {
                // Case of the user directory.
                createRequest = () => {
                    return gapi.client.drive.files.list({
                        q: fullQuery,
                        pageSize: FILE_PAGE_SIZE,
                        pageToken,
                        fields: `${FILE_LIST_FIELDS}, files(${RESOURCE_FIELDS})`
                    });
                };
            }
            return gapi_1.driveApiRequest(createRequest);
        };
        return depaginate(getPage, 'files');
    });
}
exports.searchDirectory = searchDirectory;
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
function searchSharedFiles(query = '') {
    return gapi_1.gapiInitialized.promise.then(() => {
        // Construct the query.
        let fullQuery = 'sharedWithMe = true';
        if (query) {
            fullQuery += ' and ' + query;
        }
        const getPage = (pageToken) => {
            const createRequest = () => {
                return gapi.client.drive.files.list({
                    q: fullQuery,
                    pageSize: FILE_PAGE_SIZE,
                    pageToken,
                    fields: `${FILE_LIST_FIELDS}, files(${RESOURCE_FIELDS})`
                });
            };
            return gapi_1.driveApiRequest(createRequest);
        };
        return depaginate(getPage, 'files');
    });
}
exports.searchSharedFiles = searchSharedFiles;
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
function moveFile(oldPath, newPath, fileTypeForPath) {
    if (isDummy(coreutils_1.PathExt.dirname(newPath))) {
        throw gapi_1.makeError(400, `Google Drive: "${newPath}" ` + 'is not a valid save directory');
    }
    if (oldPath === newPath) {
        return contentsModelForPath(oldPath, true, fileTypeForPath);
    }
    else {
        let newFolderPath = coreutils_1.PathExt.dirname(newPath);
        // Get a promise that resolves with the resource in the current position.
        const resourcePromise = getResourceForPath(oldPath);
        // Get a promise that resolves with the resource of the new folder.
        const newFolderPromise = getResourceForPath(newFolderPath);
        // Check the new path to make sure there isn't already a file
        // with the same name there.
        const newName = coreutils_1.PathExt.basename(newPath);
        const directorySearchPromise = searchDirectory(newFolderPath, "name = '" + newName + "'");
        // Once we have all the required information,
        // update the metadata with the new parent directory
        // for the file.
        return Promise.all([
            resourcePromise,
            newFolderPromise,
            directorySearchPromise
        ])
            .then(values => {
            const resource = values[0];
            const newFolder = values[1];
            const directorySearch = values[2];
            if (directorySearch.length !== 0) {
                throw new Error('Google Drive: File with the same name ' +
                    'already exists in the destination directory');
            }
            else {
                const createRequest = () => {
                    return gapi.client.drive.files.update({
                        fileId: resource.id,
                        addParents: newFolder.id,
                        removeParents: resource.parents ? resource.parents[0] : undefined,
                        resource: {
                            name: newName
                        },
                        fields: RESOURCE_FIELDS,
                        supportsTeamDrives: !!(resource.teamDriveId || newFolder.teamDriveId)
                    });
                };
                return gapi_1.driveApiRequest(createRequest);
            }
        })
            .then(response => {
            // Update the cache.
            Private.resourceCache.delete(oldPath);
            Private.resourceCache.set(newPath, response);
            return contentsModelForPath(newPath, true, fileTypeForPath);
        });
    }
}
exports.moveFile = moveFile;
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
function copyFile(oldPath, newPath, fileTypeForPath) {
    if (isDummy(coreutils_1.PathExt.dirname(newPath))) {
        throw gapi_1.makeError(400, `Google Drive: "${newPath}"` + ' is not a valid save directory');
    }
    if (oldPath === newPath) {
        throw gapi_1.makeError(400, 'Google Drive: cannot copy a file with' +
            ' the same name to the same directory');
    }
    else {
        let newFolderPath = coreutils_1.PathExt.dirname(newPath);
        // Get a promise that resolves with the resource in the current position.
        const resourcePromise = getResourceForPath(oldPath);
        // Get a promise that resolves with the resource of the new folder.
        const newFolderPromise = getResourceForPath(newFolderPath);
        // Check the new path to make sure there isn't already a file
        // with the same name there.
        const newName = coreutils_1.PathExt.basename(newPath);
        const directorySearchPromise = searchDirectory(newFolderPath, "name = '" + newName + "'");
        // Once we have all the required information,
        // perform the copy.
        return Promise.all([
            resourcePromise,
            newFolderPromise,
            directorySearchPromise
        ])
            .then(values => {
            const resource = values[0];
            const newFolder = values[1];
            const directorySearch = values[2];
            if (directorySearch.length !== 0) {
                throw new Error('Google Drive: File with the same name ' +
                    'already exists in the destination directory');
            }
            else {
                const createRequest = () => {
                    return gapi.client.drive.files.copy({
                        fileId: resource.id,
                        resource: {
                            parents: [newFolder.id],
                            name: newName
                        },
                        fields: RESOURCE_FIELDS,
                        supportsTeamDrives: !!(newFolder.teamDriveId || resource.teamDriveId)
                    });
                };
                return gapi_1.driveApiRequest(createRequest);
            }
        })
            .then(response => {
            // Update the cache.
            Private.resourceCache.set(newPath, response);
            return contentsModelForPath(newPath, true, fileTypeForPath);
        });
    }
}
exports.copyFile = copyFile;
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
function clearCache() {
    Private.resourceCache.clear();
}
exports.clearCache = clearCache;
/* ******** Functions for dealing with revisions ******** */
/**
 * List the revisions for a file in Google Drive.
 *
 * @param path - the path of the file.
 *
 * @returns a promise fulfilled with a list of `Contents.ICheckpointModel`
 *   that correspond to the file revisions stored on drive.
 */
function listRevisions(path) {
    return getResourceForPath(path)
        .then((resource) => {
        const getPage = (pageToken) => {
            const createRequest = () => {
                return gapi.client.drive.revisions.list({
                    fileId: resource.id,
                    pageSize: REVISION_PAGE_SIZE,
                    pageToken,
                    fields: `${REVISION_LIST_FIELDS}, revisions(${REVISION_FIELDS})`
                });
            };
            return gapi_1.driveApiRequest(createRequest);
        };
        return depaginate(getPage, 'revisions');
    })
        .then(listing => {
        const revisions = algorithm_1.map(algorithm_1.filter(listing || [], (revision) => {
            return revision.keepForever;
        }), (revision) => {
            return { id: revision.id, last_modified: revision.modifiedTime };
        });
        return algorithm_1.toArray(revisions);
    });
}
exports.listRevisions = listRevisions;
/**
 * Tell Google drive to keep the current revision. Without doing
 * this the revision would eventually be cleaned up.
 *
 * @param path - the path of the file to pin.
 *
 * @returns a promise fulfilled with an `ICheckpointModel` corresponding
 *   to the newly pinned revision.
 */
function pinCurrentRevision(path) {
    return getResourceForPath(path)
        .then((resource) => {
        const createRequest = () => {
            return gapi.client.drive.revisions.update({
                fileId: resource.id,
                revisionId: resource.headRevisionId,
                resource: {
                    keepForever: true
                }
            });
        };
        return gapi_1.driveApiRequest(createRequest);
    })
        .then(revision => {
        return { id: revision.id, last_modified: revision.modifiedTime };
    });
}
exports.pinCurrentRevision = pinCurrentRevision;
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
function unpinRevision(path, revisionId) {
    return getResourceForPath(path)
        .then((resource) => {
        const createRequest = () => {
            return gapi.client.drive.revisions.update({
                fileId: resource.id,
                revisionId: revisionId,
                resource: {
                    keepForever: false
                }
            });
        };
        return gapi_1.driveApiRequest(createRequest);
    })
        .then(() => {
        return void 0;
    });
}
exports.unpinRevision = unpinRevision;
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
function revertToRevision(path, revisionId, fileType) {
    let revisionResource;
    // Get the correct file resource.
    return getResourceForPath(path)
        .then((resource) => {
        revisionResource = resource;
        // Construct the request for a specific revision to the file.
        const createRequest = () => {
            return gapi.client.drive.revisions.get({
                fileId: revisionResource.id,
                revisionId: revisionId,
                alt: 'media'
            });
        };
        // Make the request.
        return gapi_1.driveApiRequest(createRequest);
    })
        .then((result) => {
        let content = result;
        if (fileType.fileFormat === 'base64') {
            content = btoa(result);
        }
        else if (revisionResource.mimeType === 'application/json') {
            content = JSON.stringify(result, null, 2);
        }
        const contents = {
            name: revisionResource.name,
            path: path,
            type: fileType.contentType,
            writable: revisionResource.capabilities.canEdit || true,
            created: String(revisionResource.createdTime),
            // TODO What is the appropriate modified time?
            last_modified: String(revisionResource.modifiedTime),
            mimetype: fileType.mimeTypes[0],
            content,
            format: fileType.fileFormat
        };
        // Reupload the reverted file to the head revision.
        return uploadFile(path, contents, fileType, true, undefined);
    })
        .then(() => {
        return void 0;
    });
}
exports.revertToRevision = revertToRevision;
/* *********Utility functions ********* */
/**
 * Construct a minimal files resource object from a
 * contents model.
 *
 * @param contents - The contents model.
 *
 * @param fileType - a candidate DocumentRegistry.IFileType for the given file.
 *
 * @returns a files resource object for the Google Drive API.
 *
 * #### Notes
 * This does not include any of the binary/text/json content of the
 * `contents`, just some metadata (`name` and `mimeType`).
 */
function fileResourceFromContentsModel(contents, fileType) {
    let mimeType;
    switch (contents.type) {
        case 'notebook':
            // The Contents API does not specify a notebook mimetype,
            // but the Google Drive API requires one.
            mimeType = 'application/x-ipynb+json';
            break;
        case 'directory':
            mimeType = exports.FOLDER_MIMETYPE;
            break;
        default:
            mimeType = fileType.mimeTypes[0];
            break;
    }
    return {
        name: contents.name || coreutils_1.PathExt.basename(contents.path || ''),
        mimeType
    };
}
/**
 * Obtains the Google Drive Files resource for a file or folder relative
 * to the a given folder.  The path should be a file or a subfolder, and
 * should not contain multiple levels of folders (hence the name
 * pathComponent).  It should also not contain any leading or trailing
 * slashes.
 *
 * @param pathComponent - The file/folder to find
 *
 * @param type - type of resource (file or folder)
 *
 * @param folderId - The Google Drive folder id
 *
 * @returns A promise fulfilled by either the files resource for the given
 *   file/folder, or rejected with an Error object.
 */
function getResourceForRelativePath(pathComponent, folderId, teamDriveId = '') {
    return gapi_1.gapiInitialized.promise.then(() => {
        // Construct a search query for the file at hand.
        const query = `name = \'${pathComponent}\' and trashed = false ` +
            `and \'${folderId}\' in parents`;
        // Construct a request for the files matching the query.
        let createRequest;
        if (teamDriveId) {
            createRequest = () => {
                return gapi.client.drive.files.list({
                    q: query,
                    pageSize: FILE_PAGE_SIZE,
                    fields: `${FILE_LIST_FIELDS}, files(${RESOURCE_FIELDS})`,
                    supportsTeamDrives: true,
                    includeTeamDriveItems: true,
                    corpora: 'teamDrive',
                    teamDriveId: teamDriveId
                });
            };
        }
        else {
            createRequest = () => {
                return gapi.client.drive.files.list({
                    q: query,
                    pageSize: FILE_PAGE_SIZE,
                    fields: `${FILE_LIST_FIELDS}, files(${RESOURCE_FIELDS})`
                });
            };
        }
        // Make the request.
        return gapi_1.driveApiRequest(createRequest).then(result => {
            const files = result.files || [];
            if (!files || files.length === 0) {
                throw Error('Google Drive: cannot find the specified file/folder: ' +
                    pathComponent);
            }
            else if (files.length > 1) {
                throw Error('Google Drive: multiple files/folders match: ' + pathComponent);
            }
            return files[0];
        });
    });
}
/**
 * Given the unique id string for a file in Google Drive,
 * get the files resource metadata associated with it.
 *
 * @param id - The file ID.
 *
 * @returns A promise that resolves with the files resource
 *   corresponding to `id`.
 *
 * ### Notes
 * This does not support Team Drives.
 */
function resourceFromFileId(id) {
    return gapi_1.gapiInitialized.promise.then(() => {
        const createRequest = () => {
            return gapi.client.drive.files.get({
                fileId: id,
                fields: RESOURCE_FIELDS
            });
        };
        return gapi_1.driveApiRequest(createRequest);
    });
}
/**
 * Given a name, find the user's root drive resource,
 * or a Team Drive resource with the same name.
 *
 * @param name - The Team Drive name.
 */
function driveForName(name) {
    const rootResource = resourceFromFileId('root');
    const teamDriveResources = listTeamDrives();
    return Promise.all([rootResource, teamDriveResources]).then(result => {
        const root = result[0];
        const teamDrives = result[1];
        if (root.name === name) {
            return root;
        }
        for (let drive of teamDrives) {
            if (drive.name === name) {
                return drive;
            }
        }
        throw Error(`Google Drive: cannot find Team Drive: ${name}`);
    });
}
/**
 * List the Team Drives accessible to a user.
 *
 * @returns a list of team drive resources.
 */
function listTeamDrives() {
    return gapi_1.gapiAuthorized.promise.then(() => {
        const getPage = (pageToken) => {
            const createRequest = () => {
                return gapi.client.drive.teamdrives.list({
                    fields: `${TEAMDRIVE_LIST_FIELDS}, teamDrives(${TEAMDRIVE_FIELDS})`,
                    pageSize: TEAMDRIVE_PAGE_SIZE,
                    pageToken
                });
            };
            return gapi_1.driveApiRequest(createRequest);
        };
        return depaginate(getPage, 'teamDrives');
    });
}
/**
 * Split a path into path components
 */
function splitPath(path) {
    return path.split('/').filter((s, i, a) => Boolean(s));
}
/**
 * Whether a path is a dummy directory.
 */
function isDummy(path) {
    return path === COLLECTIONS_DIRECTORY || path === SHARED_DIRECTORY;
}
exports.isDummy = isDummy;
/**
 * Whether a resource is a directory (or Team Drive),
 * which may contain items.
 */
function isDirectory(resource) {
    return !!(resource.kind === 'drive#teamDrive' || resource.mimeType === exports.FOLDER_MIMETYPE);
}
exports.isDirectory = isDirectory;
/**
 * Depaginate a series of requests into a single array.
 */
function depaginate(getPage, listName, pageToken) {
    return getPage(pageToken).then(list => {
        const total = list[listName];
        if (list.nextPageToken) {
            return depaginate(getPage, listName, list.nextPageToken).then(next => {
                return [...total, ...next];
            });
        }
        else {
            return total;
        }
    });
}
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
function getResourceForPath(path) {
    // First check the cache.
    if (Private.resourceCache.has(path)) {
        return Promise.resolve(Private.resourceCache.get(path));
    }
    const components = splitPath(path);
    if (components.length === 0) {
        // Handle the case for the pseudo folders
        // (i.e., the view onto the "My Drive" and "Shared
        // with me" directories, as well as the pseudo-root).
        return Promise.resolve(COLLECTIONS_DIRECTORY_RESOURCE);
    }
    else if (components.length === 1 && components[0] === SHARED_DIRECTORY) {
        return Promise.resolve(SHARED_DIRECTORY_RESOURCE);
    }
    else {
        // Create a Promise of a FileResource to walk the path until
        // we find the right file.
        let currentResource;
        // Current path component index.
        let idx = 0;
        // Team Drive id for the path, or the empty string if
        // the path is not in a Team Drive.
        let teamDriveId = '';
        if (components[0] === SHARED_DIRECTORY) {
            // Handle the case of the `Shared With Me` directory.
            currentResource = searchSharedFiles("name = '" + components[1] + "'").then(files => {
                if (!files || files.length === 0) {
                    throw Error('Google Drive: cannot find the specified file/folder: ' +
                        components[1]);
                }
                else if (files.length > 1) {
                    throw Error('Google Drive: multiple files/folders match: ' + components[1]);
                }
                return files[0];
            });
            idx = 2; // Set the component index to the third component.
        }
        else {
            // Handle the case of a `My Drive` or a Team Drive
            currentResource = driveForName(components[0])
                .then(drive => {
                if (drive.kind === 'drive#teamDrive') {
                    teamDriveId = drive.id;
                }
                return drive;
            })
                .catch(() => {
                throw Error(`Unexpected file in root directory: ${components[0]}`);
            });
            idx = 1;
        }
        // Loop through the remaining path components and get the resource for each
        // one, verifying that the path corresponds to a valid drive object.
        // Utility function that gets the file resource object given its name,
        // whether it is a file or a folder, and a promise for the resource
        // object of its containing folder.
        const getResource = (pathComponent, parentResource) => {
            return parentResource.then((resource) => {
                return getResourceForRelativePath(pathComponent, resource.id, teamDriveId);
            });
        };
        // Loop over the components, updating the current resource.
        // Start the loop at one to skip the pseudo-root.
        for (; idx < components.length; idx++) {
            const component = components[idx];
            currentResource = getResource(component, currentResource);
        }
        // Update the cache.
        currentResource.then(r => {
            Private.resourceCache.set(path, r);
        });
        // Resolve with the final value of currentResource.
        return currentResource;
    }
}
exports.getResourceForPath = getResourceForPath;
/**
 * Download the contents of a file from Google Drive.
 *
 * @param resource - the files resource metadata object.
 *
 * @returns a promise fulfilled with the contents of the file.
 */
function downloadResource(resource, picked = false) {
    return gapi_1.gapiInitialized.promise.then(() => {
        const createRequest = () => {
            return gapi.client.drive.files.get({
                fileId: resource.id,
                alt: 'media',
                supportsTeamDrives: !!resource.teamDriveId
            });
        };
        return gapi_1.driveApiRequest(createRequest);
    });
}
var Private;
(function (Private) {
    /**
     * A Map associating file paths with cached files
     * resources. This can significantly cut down on
     * API requests.
     */
    Private.resourceCache = new Map();
    /**
     * When we list the contents of a directory we can
     * use that opportunity to refresh the cached values
     * for that directory. This function clears all
     * the cached resources that are in a given directory.
     */
    function clearCacheForDirectory(path) {
        Private.resourceCache.forEach((value, key) => {
            let enclosingFolderPath = coreutils_1.PathExt.dirname(key);
            if (path === enclosingFolderPath) {
                Private.resourceCache.delete(key);
            }
        });
    }
    Private.clearCacheForDirectory = clearCacheForDirectory;
    /**
     * Given a list of resources in a directory, put them in
     * the resource cache. This strips any duplicates, since
     * the path-based contents manager can't handle those correctly.
     */
    function populateCacheForDirectory(path, resourceList) {
        // Identify duplicates in the list: we can't handle those
        // correctly, so don't insert them.
        const duplicatePaths = [];
        const candidatePaths = [];
        for (let resource of resourceList) {
            const filePath = coreutils_1.PathExt.join(path, resource.name);
            if (candidatePaths.indexOf(filePath) !== -1) {
                duplicatePaths.push(filePath);
            }
            else {
                candidatePaths.push(filePath);
            }
        }
        // Insert non-duplicates into the cache.
        for (let resource of resourceList) {
            const filePath = coreutils_1.PathExt.join(path, resource.name);
            if (duplicatePaths.indexOf(filePath) === -1) {
                Private.resourceCache.set(filePath, resource);
            }
        }
    }
    Private.populateCacheForDirectory = populateCacheForDirectory;
})(Private || (Private = {}));
