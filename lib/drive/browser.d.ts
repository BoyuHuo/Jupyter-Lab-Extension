import { Widget } from '@phosphor/widgets';
import { CommandRegistry } from '@phosphor/commands';
import { ISettingRegistry } from '@jupyterlab/coreutils';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
/**
 * Google Drive filebrowser plugin state namespace.
 */
export declare const NAMESPACE = "google-drive-filebrowser";
/**
 * Widget for hosting the Google Drive filebrowser.
 */
export declare class GoogleDriveFileBrowser extends Widget {
    /**
     * Construct the browser widget.
     */
    constructor(driveName: string, registry: DocumentRegistry, commands: CommandRegistry, manager: IDocumentManager, factory: IFileBrowserFactory, settingsPromise: Promise<ISettingRegistry.ISettings>, hasOpenDocuments: () => boolean);
    /**
     * Whether the widget has been disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resource held by the widget.
     */
    dispose(): void;
    private _createBrowser;
    private _onLogoutClicked;
    private _isDisposed;
    private _browser;
    private _loginScreen;
    private _logoutButton;
    private _commands;
    private _factory;
    private _driveName;
    private _hasOpenDocuments;
}
export declare class GoogleDriveLogin extends Widget {
    /**
     * Construct the login panel.
     */
    constructor(settingsPromise: Promise<ISettingRegistry.ISettings>);
    /**
     * Handle a click of the login button.
     */
    private _onLoginClicked;
    private _button;
    private _clientId;
}
