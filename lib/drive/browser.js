"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
const apputils_1 = require("@jupyterlab/apputils");
const gapi_1 = require("../gapi");
/**
 * Google Drive filebrowser plugin state namespace.
 */
exports.NAMESPACE = 'google-drive-filebrowser';
/**
 * CSS class for the filebrowser container.
 */
const GOOGLE_DRIVE_FILEBROWSER_CLASS = 'jp-GoogleDriveFileBrowser';
/**
 * CSS class for login panel.
 */
const LOGIN_SCREEN = 'jp-GoogleLoginScreen';
/**
 * Widget for hosting the Google Drive filebrowser.
 */
class GoogleDriveFileBrowser extends widgets_1.Widget {
    /**
     * Construct the browser widget.
     */
    constructor(driveName, registry, commands, manager, factory, settingsPromise, hasOpenDocuments) {
        super();
        this._isDisposed = false;
        this.addClass(GOOGLE_DRIVE_FILEBROWSER_CLASS);
        this.layout = new widgets_1.PanelLayout();
        // Initialize with the Login screen.
        this._loginScreen = new GoogleDriveLogin(settingsPromise);
        this.layout.addWidget(this._loginScreen);
        this._hasOpenDocuments = hasOpenDocuments;
        // Keep references to the createFileBrowser arguments for
        // when we need to construct it.
        this._commands = commands;
        this._factory = factory;
        this._driveName = driveName;
        // After authorization and we are ready to use the
        // drive, swap out the widgets.
        gapi_1.gapiAuthorized.promise.then(() => {
            this._createBrowser();
        });
    }
    /**
     * Whether the widget has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /**
     * Dispose of the resource held by the widget.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._loginScreen.dispose();
        this._browser.dispose();
        super.dispose();
    }
    _createBrowser() {
        // Create the file browser
        this._browser = this._factory.createFileBrowser(exports.NAMESPACE, {
            commands: this._commands,
            driveName: this._driveName
        });
        // Create the logout button.
        const userProfile = gapi_1.getCurrentUserProfile();
        this._logoutButton = new apputils_1.ToolbarButton({
            onClick: () => {
                this._onLogoutClicked();
            },
            tooltip: `Sign Out (${userProfile.getEmail()})`,
            iconClassName: 'jp-GoogleUserBadge jp-Icon jp-Icon-16'
        });
        this._browser.toolbar.addItem('logout', this._logoutButton);
        this._loginScreen.parent = null;
        this.layout.addWidget(this._browser);
    }
    _onLogoutClicked() {
        if (this._hasOpenDocuments()) {
            apputils_1.showDialog({
                title: 'Sign Out',
                body: 'Please close all documents in Google Drive before signing out',
                buttons: [apputils_1.Dialog.okButton({ label: 'OK' })]
            });
            return;
        }
        // Change to the root directory, so an invalid path
        // is not cached, then sign out.
        this._browser.model.cd('/').then(() => {
            // Swap out the file browser for the login screen.
            this._browser.parent = null;
            this.layout.addWidget(this._loginScreen);
            this._browser.dispose();
            this._logoutButton.dispose();
            // Do the actual sign-out.
            gapi_1.signOut().then(() => {
                // After sign-out, set up a new listener
                // for authorization, should the user log
                // back in.
                gapi_1.gapiAuthorized.promise.then(() => {
                    this._createBrowser();
                });
            });
        });
    }
}
exports.GoogleDriveFileBrowser = GoogleDriveFileBrowser;
class GoogleDriveLogin extends widgets_1.Widget {
    /**
     * Construct the login panel.
     */
    constructor(settingsPromise) {
        super();
        this.addClass(LOGIN_SCREEN);
        // Add the logo.
        const logo = document.createElement('div');
        logo.className = 'jp-GoogleDrive-logo';
        this.node.appendChild(logo);
        // Add the text.
        const text = document.createElement('div');
        text.className = 'jp-GoogleDrive-text';
        text.textContent = 'Google Drive';
        this.node.appendChild(text);
        // Add the login button.
        this._button = document.createElement('button');
        this._button.title = 'Log into your Google account';
        this._button.textContent = 'SIGN IN';
        this._button.className = 'jp-Dialog-button jp-mod-styled jp-mod-accept';
        this._button.onclick = this._onLoginClicked.bind(this);
        this._button.style.visibility = 'hidden';
        this.node.appendChild(this._button);
        // Attempt to authorize on construction without using
        // a popup dialog. If the user is logged into the browser with
        // a Google account, this will likely succeed. Otherwise, they
        // will need to login explicitly.
        settingsPromise.then(settings => {
            this._clientId = settings.get('clientId').composite;
            gapi_1.initializeGapi(this._clientId)
                .then(loggedIn => {
                if (!loggedIn) {
                    this._button.style.visibility = 'visible';
                }
                else {
                    gapi_1.gapiAuthorized.promise.then(() => {
                        // Set the button style to visible in the
                        // eventuality that the user logs out.
                        this._button.style.visibility = 'visible';
                    });
                }
            })
                .catch((err) => {
                apputils_1.showDialog({
                    title: 'Google API Error',
                    body: err,
                    buttons: [apputils_1.Dialog.okButton({ label: 'OK' })]
                });
            });
        });
    }
    /**
     * Handle a click of the login button.
     */
    _onLoginClicked() {
        gapi_1.signIn();
    }
}
exports.GoogleDriveLogin = GoogleDriveLogin;
