// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import '../style/index.css';

import {
  ILayoutRestorer,
  JupyterLab,
  JupyterLabPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ISettingRegistry } from '@jupyterlab/coreutils';

import { IDocumentManager } from '@jupyterlab/docmanager';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { IMainMenu } from '@jupyterlab/mainmenu';
import { PanelLayout } from '@phosphor/widgets';

import { NebulaFileBrowser } from './browser';

/**
 * The command IDs used by the plugins.
 */
namespace CommandIDs {
  export const clear = 'chatbox:clear';

  export const run = 'chatbox:post';

  export const linebreak = 'chatbox:linebreak';

  export const shareCurrent = `google-drive:share-current`;

  export const shareBrowser = `google-drive:share-browser-item`;
}

/**
 * The JupyterLab plugin for the Google Drive Filebrowser.
 */
const fileBrowserPlugin: JupyterLabPlugin<void> = {
  id: '@jupyterlab/google-drive:drive',
  requires: [
    ICommandPalette,
    IDocumentManager,
    IFileBrowserFactory,
    ILayoutRestorer,
    IMainMenu,
    ISettingRegistry
  ],
  activate: activateFileBrowser,
  autoStart: true
};

/**
 * Activate the file browser.
 */
function activateFileBrowser(
  app: JupyterLab,
  palette: ICommandPalette,

  restorer: ILayoutRestorer,
  mainMenu: IMainMenu
): void {
  console.log('Hahohohohsdfdsfdsf');

  // Add the Google Drive backend to the contents manager.

  // Construct a function that determines whether any documents
  // associated with this filebrowser are currently open.

  // Create the file browser.
  const browser = new NebulaFileBrowser();

  browser.title.iconClass = 'jp-GoogleDrive-icon jp-SideBar-tabIcon';
  browser.title.caption = 'Google Drive';
  browser.id = 'google-drive-file-browser';
  browser.layout = new PanelLayout();

  // Add the file browser widget to the application restorer.
  app.shell.addToLeftArea(browser, { rank: 101 });
  // matches only non-directory items in the Google Drive browser.
  const selector =
    '.jp-GoogleDriveFileBrowser .jp-DirListing-item[data-isdir="false"]';

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
const plugins: JupyterLabPlugin<any>[] = [fileBrowserPlugin];
export default plugins;
