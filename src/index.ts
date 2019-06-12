import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette
} from '@jupyterlab/apputils';

import '../style/index.css';

import {
  Widget
} from '@phosphor/widgets';

import{
  TestWidget
} from './test'


/**
 * Initialization data for the testextension extension.
 */

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_xkcd',
  autoStart: true,
  requires: [ICommandPalette],
  activate: activate
};

function activate(app: JupyterLab, palette: ICommandPalette){
    console.log('JupyterLab extension testextension is activated!');
    console.log('Woohahahahaha');

    let widget: Widget = new TestWidget();
    widget.id = 'test-jupyterlab';
    widget.title.label = 'test.com';
    widget.title.closable = true;

    // Add an application command
    const command: string = 'xkcd:open';
    app.commands.addCommand(command, {
      label: 'pisces-test',
      execute: () => {
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.addToMainArea(widget);
        }
        // Activate the widget
        app.shell.activateById(widget.id);

        widget.addClass('nebula-test'); // new line

        // Add an image element to the panel
        let img = document.createElement('img');
        widget.node.appendChild(img);

        // Fetch the picture
        img.src = "https://nebula-ai.com/imgs/logo_181205.png";

      }
    });

    palette.addItem({ command, category: 'Tutorial' });
  }

export default extension;
