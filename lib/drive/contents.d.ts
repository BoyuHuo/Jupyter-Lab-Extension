import { ISignal } from '@phosphor/signaling';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { ModelDB } from '@jupyterlab/observables';
import { Contents, ServerConnection } from '@jupyterlab/services';
/**
 * A contents manager that passes file operations to the server.
 *
 * This includes checkpointing with the normal file operations.
 */
export declare class GoogleDrive implements Contents.IDrive {
    /**
     * Construct a new contents manager object.
     *
     * @param options - The options used to initialize the object.
     */
    constructor(registry: DocumentRegistry);
    /**
     * The name of the drive.
     */
    readonly name: 'GDrive';
    /**
     * Getter for the IModelDB factory.
     */
    readonly modelDBFactory: ModelDB.IFactory;
    /**
     * Server settings (unused for interfacing with Google Drive).
     */
    readonly serverSettings: ServerConnection.ISettings;
    /**
     * A signal emitted when a file operation takes place.
     */
    readonly fileChanged: ISignal<this, Contents.IChangedArgs>;
    /**
     * Test whether the manager has been disposed.
     */
    readonly isDisposed: boolean;
    /**h
     * Dispose of the resources held by the manager.
     */
    dispose(): void;
    /**
     * Get the base url of the manager.
     */
    readonly baseUrl: string;
    /**
     * Get a file or directory.
     *
     * @param path: The path to the file.
     *
     * @param options: The options used to fetch the file.
     *
     * @returns A promise which resolves with the file content.
     */
    get(path: string, options?: Contents.IFetchOptions): Promise<Contents.IModel>;
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
    getDownloadUrl(path: string): Promise<string>;
    /**
     * Create a new untitled file or directory in the specified directory path.
     *
     * @param options: The options used to create the file.
     *
     * @returns A promise which resolves with the created file content when the
     *    file is created.
     */
    newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel>;
    /**
     * Delete a file.
     *
     * @param path - The path to the file.
     *
     * @returns A promise which resolves when the file is deleted.
     */
    delete(path: string): Promise<void>;
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
    rename(path: string, newPath: string): Promise<Contents.IModel>;
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
    save(path: string, options: Partial<Contents.IModel>): Promise<Contents.IModel>;
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
    copy(fromFile: string, toDir: string): Promise<Contents.IModel>;
    /**
     * Create a checkpoint for a file.
     *
     * @param path - The path of the file.
     *
     * @returns A promise which resolves with the new checkpoint model when the
     *   checkpoint is created.
     */
    createCheckpoint(path: string): Promise<Contents.ICheckpointModel>;
    /**
     * List available checkpoints for a file.
     *
     * @param path - The path of the file.
     *
     * @returns A promise which resolves with a list of checkpoint models for
     *    the file.
     */
    listCheckpoints(path: string): Promise<Contents.ICheckpointModel[]>;
    /**
     * Restore a file to a known checkpoint state.
     *
     * @param path - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to restore.
     *
     * @returns A promise which resolves when the checkpoint is restored.
     */
    restoreCheckpoint(path: string, checkpointID: string): Promise<void>;
    /**
     * Delete a checkpoint for a file.
     *
     * @param path - The path of the file.
     *
     * @param checkpointID - The id of the checkpoint to delete.
     *
     * @returns A promise which resolves when the checkpoint is deleted.
     */
    deleteCheckpoint(path: string, checkpointID: string): Promise<void>;
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
    private _getNewFilename;
    private _baseUrl;
    private _isDisposed;
    private _docRegistry;
    private _fileTypeForPath;
    private _fileTypeForContentsModel;
    private _fileChanged;
}
