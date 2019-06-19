"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
require("../style/index.css");
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const docmanager_1 = require("@jupyterlab/docmanager");
const filebrowser_1 = require("@jupyterlab/filebrowser");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const widgets_1 = require("@phosphor/widgets");
const browser_1 = require("./browser");
/**
 * The command IDs used by the plugins.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.clear = 'chatbox:clear';
    CommandIDs.run = 'chatbox:post';
    CommandIDs.linebreak = 'chatbox:linebreak';
    CommandIDs.shareCurrent = `google-drive:share-current`;
    CommandIDs.shareBrowser = `google-drive:share-browser-item`;
})(CommandIDs || (CommandIDs = {}));
/**
 * The JupyterLab plugin for the Google Drive Filebrowser.
 */
const fileBrowserPlugin = {
    id: '@jupyterlab/google-drive:drive',
    requires: [
        apputils_1.ICommandPalette,
        docmanager_1.IDocumentManager,
        filebrowser_1.IFileBrowserFactory,
        application_1.ILayoutRestorer,
        mainmenu_1.IMainMenu,
        coreutils_1.ISettingRegistry
    ],
    activate: activateFileBrowser,
    autoStart: true
};
/**
 * Activate the file browser.
 */
function activateFileBrowser(app, palette, restorer, mainMenu) {
    console.log("Hahohohohsdfdsfdsf");
    // Add the Google Drive backend to the contents manager.
    // Construct a function that determines whether any documents
    // associated with this filebrowser are currently open.
    // Create the file browser.
    const browser = new browser_1.NebulaFileBrowser();
    browser.title.iconClass = 'jp-GoogleDrive-icon jp-SideBar-tabIcon';
    browser.title.caption = 'Google Drive';
    browser.id = 'google-drive-file-browser';
    browser.layout = new widgets_1.PanelLayout();
    // Add the file browser widget to the application restorer.
    app.shell.addToLeftArea(browser, { rank: 101 });
    // matches only non-directory items in the Google Drive browser.
    const selector = '.jp-GoogleDriveFileBrowser .jp-DirListing-item[data-isdir="false"]';
    app.contextMenu.addItem({
        command: CommandIDs.shareBrowser,
        selector,
        rank: 100
    });
    palette.addItem({
        command: CommandIDs.shareCurrent,
        category: 'File Operations'
    });
    mainMenu.fileMenu.addGroup([{ command: CommandIDs.shareCurrent }], 20);
    return;
}
/**
 * Export the plugins as default.
 */
const plugins = [fileBrowserPlugin];
exports.default = plugins;
