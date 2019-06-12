"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
class TestWidget extends widgets_1.Widget {
    constructor() {
        super();
        this.id = 'xkcd-jupyterlab';
        this.title.label = 'xkcd.com';
        this.title.closable = true;
        this.addClass('jp-xkcdWidget');
        this.img = document.createElement('img');
        this.img.className = 'jp-xkcdCartoon';
        this.node.appendChild(this.img);
        this.img.insertAdjacentHTML('afterend', `<div class="jp-xkcdAttribution">
        <a href="https://creativecommons.org/licenses/by-nc/2.5/" class="jp-xkcdAttribution" target="_blank">
          <img src="https://licensebuttons.net/l/by-nc/2.5/80x15.png" />
        </a>
      </div>`);
    }
    /**
     * Handle update requests for the widget.
     */
    onUpdateRequest(msg) {
        fetch('https://egszlpbmle.execute-api.us-east-1.amazonaws.com/prod').then(response => {
            return response.json();
        }).then(data => {
            this.img.src = data.img;
            this.img.alt = data.title;
            this.img.title = data.alt;
        });
    }
}
exports.TestWidget = TestWidget;
