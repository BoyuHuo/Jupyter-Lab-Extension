"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const signaling_1 = require("@phosphor/signaling");
const coreutils_1 = require("@jupyterlab/coreutils");
const docregistry_1 = require("@jupyterlab/docregistry");
const observables_1 = require("@jupyterlab/observables");
const services_1 = require("@jupyterlab/services");
const modeldb_1 = require("../realtime/modeldb");
const drive = require("./drive");
const gapi_1 = require("../gapi");
/**
 * A contents manager that passes file operations to the server.
 *
 * This includes checkpointing with the normal file operations.
 */
class GoogleDrive {
    /**
     * Construct a new contents manager object.
     *
     * @param options - The options used to initialize the object.
     */
    constructor(registry) {
        this._baseUrl = 'https://www.googleapis.com/drive/v3';
        this._isDisposed = false;
        this._fileChanged = new signaling_1.Signal(this);
        this._docRegistry = registry;
        // Construct a function to make a best-guess IFileType
        // for a given path.
        this._fileTypeForPath = (path) => {
            const fileTypes = registry.getFileTypesForPath(path);
            return fileTypes.length === 0
                ? registry.getFileType('text')
                : fileTypes[0];
        };
        // Construct a function to return a best-guess IFileType
        // for a given contents model.
        this._fileTypeForContentsModel = (model) => {
            return registry.getFileTypeForModel(model);
        };
    }
    /**
     * The name of the drive.
     */
    get name() {
        return 'GDrive';
    }
    /**
     * Getter for the IModelDB factory.
     */
    get modelDBFactory() {
        if (gapi_1.realtimeLoaded) {
            return {
                createNew: (path) => {
                    return new modeldb_1.GoogleModelDB({ filePath: path });
                }
            };
        }
        else {
            return {
                // If the realtime APIs have not been loaded,
                // make a new in-memory ModelDB.
                createNew: (path) => {
                    return new observables_1.ModelDB();
                }
            };
        }
    }
    /**
     * A signal emitted when a file operation takes place.
     */
    get fileChanged() {
        return this._fileChanged;
    }
    /**
     * Test whether the manager has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**h
     * Dispose of the resources held by the manager.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        signaling_1.Signal.clearData(this);
    }
    /**
     * Get the base url of the manager.
     */
    get baseUrl() {
        return this._baseUrl;
    }
    /**
     * Get a file or directory.
     *
     * @param path: The path to the file.
     *
     * @param options: The options used to fetch the file.
     *
     * @returns A promise which resolves with the file content.
     */
    get(path, options) {
        const getContent = options ? !!options.content : true;
        // TODO: the contents manager probably should not be passing in '.'.
        path = path === '.' ? '' : path;
        return drive
            .contentsModelForPath(path, getContent, this._fileTypeForPath)
            .then(contents => {
            try {
                services_1.Contents.validateContentsModel(contents);
            }
            catch (error) {
                throw gapi_1.makeError(200, error.message);
            }
            return contents;
        });
    }
    /**
     * Get an encoded download url given a file path.
     *
     * @param path - An absolute POSIX file path on the server.
     *
     * #### Notes
     * It is expected that the path contains no relative paths,
     * use [[ContentsManager.getAbsolutePath]] to get an absolute
     * path if necessary.
     */
    getDownloadUrl(path) {
        return drive.urlForFile(path);
    }
    /**
     * Create a new untitled file or directory in the specified directory path.
     *
     * @param options: The options used to create the file.
     *
     * @returns A promise which resolves with the created file content when the
     *    file is created.
     */
    newUntitled(options = {}) {
        // Set default values.
        let ext = '';
        let baseName = 'Untitled';
        let path = '';
        let contentType = 'notebook';
        let fileType;
        if (options) {
            // Add leading `.` to extension if necessary.
            ext = options.ext ? coreutils_1.PathExt.normalizeExtension(options.ext) : ext;
            // If we are not creating in the root directory.
            path = options.path || '';
            contentType = options.type || 'notebook';
        }
        let model;
        if (contentType === 'notebook') {
            fileType = docregistry_1.DocumentRegistry.defaultNotebookFileType;
            ext = ext || fileType.extensions[0];
            baseName = 'Untitled';
            const modelFactory = this._docRegistry.getModelFactory('Notebook');
            if (!modelFactory) {
                throw Error('No model factory is registered with the DocRegistry');
            }
            model = {
                type: fileType.contentType,
                content: modelFactory.createNew().toJSON(),
                mimetype: fileType.mimeTypes[0],
                format: fileType.fileFormat
            };
        }
        else if (contentType === 'file') {
            fileType = docregistry_1.DocumentRegistry.defaultTextFileType;
            ext = ext || fileType.extensions[0];
            baseName = 'untitled';
            model = {
                type: fileType.contentType,
                content: '',
                mimetype: fileType.mimeTypes[0],
                format: fileType.fileFormat
            };
        }
        else if (contentType === 'directory') {
            fileType = docregistry_1.DocumentRegistry.defaultDirectoryFileType;
            ext = ext || '';
            baseName = 'Untitled Folder';
            model = {
                type: fileType.contentType,
                content: [],
                format: fileType.fileFormat
            };
        }
        else {
            throw new Error('Unrecognized type ' + contentType);
        }
        return this._getNewFilename(path, ext, baseName)
            .then((name) => {
            const m = Object.assign({}, model, { name });
            path = coreutils_1.PathExt.join(path, name);
            return drive.uploadFile(path, m, fileType, false, this._fileTypeForPath);
        })
            .then((contents) => {
            try {
                services_1.Contents.validateContentsModel(contents);
            }
            catch (error) {
                throw gapi_1.makeError(201, error.message);
            }
            this._fileChanged.emit({
                type: 'new',
                oldValue: null,
                newValue: contents
            });
            return contents;
        });
    }
    /**
     * Delete a file.
     *
     * @param path - The path to the file.
     *
     * @returns A promise which resolves when the file is deleted.
     */
    delete(path) {
        return drive.deleteFile(path).then(() => {
            this._fileChanged.emit({
                type: 'delete',
                oldValue: { path },
                newValue: null
            });
            return void 0;
        });
    }
    /**
     * Rename a file or directory.
     *
     * @param path - The original file path.
     *
     * @param newPath - The new file path.
     *
     * @returns A promise which resolves with the new file contents model when
     *   the file is renamed.
     */
    rename(path, newPath) {
        if (path === newPath) {
            return this.get(path);
        }
        else {
            return drive
                .moveFile(path, newPath, this._fileTypeForPath)
                .then((contents) => {
                try {
                    services_1.Contents.validateContentsModel(contents);
                }
                catch (error) {
                    throw gapi_1.makeError(200, error.message);
                }
                this._fileChanged.emit({
                    type: 'rename',
                    oldValue: { path },
                    newValue: contents
                });
                return contents;
            });
        }
    }
    /**
     * Save a file.
     *
     * @param path - The desired file path.
     *
     * @param options - Optional overrides to the model.
     *
     * @returns A promise which resolves with the file content model when the
     *   file is saved.
     */
    save(path, options) {
        const fileType = this._fileTypeForContentsModel(options);
        return this.get(path)
            .then(contents => {
            // The file exists.
            if (options) {
                // Overwrite the existing file.
                return drive.uploadFile(path, options, fileType, true, this._fileTypeForPath);
            }
            else {
                // File exists, but we are not saving anything
                // to it? Just return the contents.
                return contents;
            }
        }, () => {
            // The file does not exist already, create a new one.
            return drive.uploadFile(path, options, fileType, false, this._fileTypeForPath);
        })
            .then((contents) => {
            try {
                services_1.Contents.validateContentsModel(contents);
            }
            catch (error) {
                throw gapi_1.makeError(200, error.message);
            }
            this._fileChanged.emit({
                type: 'save',
                oldValue: null,
                newValue: contents
            });
            return contents;
        });
    }
    /**
     * Copy a file into a given directory.
     *
     * @param path - The original file path.
     *
     * @param toDir - The destination directory path.
     *
     * @returns A promise which resolves with the new contents model when the
     *  file is copied.
     */
    copy(fromFile, toDir) {
        let fileBasename = coreutils_1.PathExt.basename(fromFile).split('.')[0];
        fileBasename += '-Copy';
        const ext = coreutils_1.PathExt.extname(fromFile);
        return this._getNewFilename(toDir, ext, fileBasename).then(name => {
            return drive
                .copyFile(fromFile, coreutils_1.PathExt.join(toDir, name), this._fileTypeForPath)
                .then(contents => {
                try {
                    services_1.Contents.validateContentsModel(contents);
                }
                catch (error) {
                    throw gapi_1.makeError(201, error.message);
                }
                this._fileChanged.emit({
                    type: 'new',
                    oldValue: null,
                    newValue: contents
                });
                return contents;
            });
        });
    }
    /**
     * Create a checkpoint for a file.
     *
     * @param path - The path of the file.
     *
     * @returns A promise which resolves with the new checkpoint model when the
     *   checkpoint is created.
     */
    createCheckpoint(path) {
        return drive.pinCurrentRevision(path).then(checkpoint => {
            try {
                services_1.Contents.validateCheckpointModel(checkpoint);
            }
            catch (error) {
                throw gapi_1.makeError(200, error.message);
            }
            return checkpoint;
        });
    }
    /**
     * List available checkpoints for a file.
     *
     * @param path - The path of the file.
     *
     * @returns A promise which resolves with a list of checkpoint models for
     *    the file.
     */
    listCheckpoints(path) {
        return drive.listRevisions(path).then(checkpoints => {
            try {
                for (let checkpoint of checkpoints) {
                    services_1.Contents.validateCheckpointModel(checkpoint);
                }
            }
            catch (error) {
                throw gapi_1.makeError(200, error.message);
            }
            return checkpoints;
        });
    }
    /**
     * Restore a file to a known checkpoint state.
     *
     * @param path - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to restore.
     *
     * @returns A promise which resolves when the checkpoint is restored.
     */
    restoreCheckpoint(path, checkpointID) {
        // TODO: should this emit a signal?
        const fileType = this._fileTypeForPath(path);
        return drive.revertToRevision(path, checkpointID, fileType);
    }
    /**
     * Delete a checkpoint for a file.
     *
     * @param path - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to delete.
     *
     * @returns A promise which resolves when the checkpoint is deleted.
     */
    deleteCheckpoint(path, checkpointID) {
        return drive.unpinRevision(path, checkpointID);
    }
    /**
     * Obtains the filename that should be used for a new file in a given
     * folder.  This is the next file in the series Untitled0, Untitled1, ... in
     * the given drive folder.  As a fallback, returns Untitled.
     *
     * @param path - The path of the directory in which we are making the file.
     * @param ext - The file extension.
     * @param baseName - The base name of the new file
     * @return A promise fullfilled with the new filename.
     */
    _getNewFilename(path, ext, baseName) {
        // Check that the target directory is a valid
        // directory (i.e., not the pseudo-root or
        // the "Shared with me" directory).
        if (drive.isDummy(path)) {
            throw gapi_1.makeError(400, `Google Drive: "${path}"` + ' is not a valid save directory');
        }
        // Get the file listing for the directory.
        const query = "name contains '" + baseName + "' and name contains '" + ext + "'";
        return drive.searchDirectory(path, query).then(resourceList => {
            const existingNames = {};
            for (let i = 0; i < resourceList.length; i++) {
                existingNames[resourceList[i].name] = true;
            }
            // Loop over the list and select the first name that
            // does not exist. Note that the loop is N+1 iterations,
            // so is guaranteed to come up with a name that is not
            // in `existingNames`.
            for (let i = 0; i <= resourceList.length; i++) {
                const filename = baseName + (i > 0 ? String(i) : '') + ext;
                if (!existingNames[filename]) {
                    return filename;
                }
            }
            // Should not get here.
            throw Error('Could not find a valid filename');
        });
    }
}
exports.GoogleDrive = GoogleDrive;
