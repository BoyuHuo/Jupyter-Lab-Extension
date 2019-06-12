"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
require("../style/index.css");
const test_1 = require("./test");
/**
 * Initialization data for the testextension extension.
 */
const extension = {
    id: 'jupyterlab_xkcd',
    autoStart: true,
    requires: [apputils_1.ICommandPalette],
    activate: activate
};
function activate(app, palette) {
    console.log('JupyterLab extension testextension is activated!');
    console.log('Woohahahahaha');
    let widget = new test_1.TestWidget();
    widget.id = 'test-jupyterlab';
    widget.title.label = 'test.com';
    widget.title.closable = true;
    // Add an application command
    const command = 'xkcd:open';
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
exports.default = extension;
