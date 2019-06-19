"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
/**
 * The class name added to the chatbox entries.
 */
exports.CHAT_ENTRY_CLASS = 'jp-ChatEntry';
/**
 * The class name added to chatbox badges.
 */
const CHAT_BADGE_CLASS = 'jp-ChatEntry-badge';
/**
 * The class name added to other user's own entries
 */
const CHAT_ENTRY_SELF_CLASS = 'jp-ChatEntry-self';
/**
 * The class name added to other user's chatbox entries
 */
const CHAT_ENTRY_RECEIVED_CLASS = 'jp-ChatEntry-receieved';
/**
 * A chat entry widget, which hosts a user badge and a markdown cell.
 */
class ChatEntry extends widgets_1.Widget {
    /**
     * Construct a chat entry widget.
     */
    constructor(options) {
        super();
        this.addClass(exports.CHAT_ENTRY_CLASS);
        this.model = options.model;
        this.layout = new widgets_1.PanelLayout();
        const color = this.model.author.color;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        this._badge = new widgets_1.Widget();
        this._badge.addClass(CHAT_BADGE_CLASS);
        const badgeName = this.model.author.shortName;
        this._badge.node.textContent = badgeName;
        this.cell = options.cell;
        this._badge.node.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
        if (!options.isMe) {
            this.cell.addClass(CHAT_ENTRY_RECEIVED_CLASS);
        }
        else {
            this.cell.addClass(CHAT_ENTRY_SELF_CLASS);
        }
        const layout = this.layout;
        if (options.isMe) {
            layout.addWidget(this.cell);
            layout.addWidget(this._badge);
        }
        else {
            layout.addWidget(this._badge);
            layout.addWidget(this.cell);
        }
    }
}
exports.ChatEntry = ChatEntry;
