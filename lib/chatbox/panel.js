"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
const coreutils_1 = require("@jupyterlab/coreutils");
const chatbox_1 = require("./chatbox");
/**
 * The class name added to chatbox panels.
 */
const PANEL_CLASS = 'jp-ChatboxPanel';
/**
 * The class name added to the document info widget.
 */
const DOCUMENT_INFO_CLASS = 'jp-ChatboxDocumentInfo';
/**
 * The class name added to a button icon node.
 */
const ICON_CLASS = 'jp-FileButtons-buttonIcon';
/**
 * The class name added to a material icon button.
 */
const MATERIAL_CLASS = 'jp-MaterialIcon';
/**
 * The class name added to the add button.
 */
const CHAT_ICON = 'jp-ChatIcon';
/**
 * A panel which contains a chatbox and the ability to add other children.
 */
class ChatboxPanel extends widgets_1.Panel {
    /**
     * Construct a chatbox panel.
     */
    constructor(options) {
        super();
        this.addClass(PANEL_CLASS);
        const factory = options.contentFactory;
        const rendermime = options.rendermime;
        const contentFactory = factory.chatboxContentFactory;
        this._documentInfo = new ChatboxDocumentInfo();
        this.addWidget(this._documentInfo);
        this.chatbox = new chatbox_1.Chatbox({
            rendermime,
            contentFactory
        });
        this.addWidget(this.chatbox);
        this.id = 'chatbox';
    }
    /**
     * The current document context for the chat.
     */
    get context() {
        return this._context;
    }
    set context(value) {
        if (this._context === value) {
            return;
        }
        this._context = value;
        this.chatbox.model = value ? value.model : undefined;
        this._documentInfo.context = value;
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        this.chatbox.dispose();
        this._documentInfo.dispose();
        super.dispose();
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        this.chatbox.prompt.editor.focus();
    }
    /**
     * Handle `'close-request'` messages.
     */
    onCloseRequest(msg) {
        super.onCloseRequest(msg);
        this.dispose();
    }
}
exports.ChatboxPanel = ChatboxPanel;
/**
 * A class representing a widget displaying document information
 * for the chatbox.
 */
class ChatboxDocumentInfo extends widgets_1.Widget {
    constructor() {
        super();
        this.addClass(DOCUMENT_INFO_CLASS);
        const chatIcon = document.createElement('div');
        chatIcon.className = ICON_CLASS + ' ' + MATERIAL_CLASS + ' ' + CHAT_ICON;
        const fileName = document.createElement('div');
        fileName.className = 'jp-ChatboxDocumentInfo-name';
        this.node.appendChild(chatIcon);
        this.node.appendChild(fileName);
    }
    /**
     * The current document context for the chat.
     */
    get context() {
        return this._context;
    }
    set context(value) {
        if (this._context) {
            this._context.pathChanged.disconnect(this._onPathChanged, this);
        }
        this._context = value;
        if (this._context) {
            this._context.pathChanged.connect(this._onPathChanged, this);
            this.node.children[1].textContent = coreutils_1.PathExt.basename(this._context.path);
        }
    }
    /**
     * Handle a file moving/renaming.
     */
    _onPathChanged(sender, path) {
        this.node.children[1].textContent = coreutils_1.PathExt.basename(path);
    }
}
exports.ChatboxDocumentInfo = ChatboxDocumentInfo;
/**
 * A namespace for ChatboxPanel statics.
 */
(function (ChatboxPanel) {
    /**
     * Default implementation of `IContentFactory`.
     */
    class ContentFactory {
        /**
         * Create a new content factory.
         */
        constructor(options) {
            this.editorFactory = options.editorFactory;
            this.chatboxContentFactory =
                options.chatboxContentFactory ||
                    new chatbox_1.Chatbox.ContentFactory({
                        editorFactory: this.editorFactory
                    });
        }
    }
    ChatboxPanel.ContentFactory = ContentFactory;
})(ChatboxPanel = exports.ChatboxPanel || (exports.ChatboxPanel = {}));
