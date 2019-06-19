"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
const disposable_1 = require("@phosphor/disposable");
const widgets_1 = require("@phosphor/widgets");
const dragdrop_1 = require("@phosphor/dragdrop");
const cells_1 = require("@jupyterlab/cells");
const coreutils_2 = require("@jupyterlab/coreutils");
const entry_1 = require("./entry");
/**
 * The class name added to chatbox widgets.
 */
const CHATBOX_CLASS = 'jp-Chatbox';
/**
 * The class name of the active prompt
 */
const PROMPT_CLASS = 'jp-Chatbox-prompt';
/**
 * The class name of the panel that holds cell content.
 */
const CONTENT_CLASS = 'jp-Chatbox-content';
/**
 * The class name of the panel that holds prompts.
 */
const INPUT_CLASS = 'jp-Chatbox-input';
/**
 * The class name added to drag images.
 */
const DRAG_IMAGE_CLASS = 'jp-dragImage';
/**
 * The class name added to a filled circle.
 */
const FILLED_CIRCLE_CLASS = 'jp-filledCircle';
/**
 * The mimetype used for Jupyter cell data.
 */
const JUPYTER_CELL_MIME = 'application/vnd.jupyter.cells';
/**
 * The threshold in pixels to start a drag event.
 */
const DRAG_THRESHOLD = 5;
/**
 * The number of new entries to render upon loading a
 * new page of the chatlog.
 */
const PAGE_LENGTH = 20;
/**
 * The scroll position at which to request a new page.
 */
const NEW_PAGE_POSITION = 300;
/**
 * Throttle for scrolling for a new page.
 */
const SCROLL_THROTTLE = 1000;
/**
 * A widget containing a Jupyter chatbox.
 *
 * #### Notes
 * The Chatbox class is intended to be used within a ChatboxPanel
 * instance. Under most circumstances, it is not instantiated by user code.
 */
class Chatbox extends widgets_1.Widget {
    /**
     * Construct a chatbox widget.
     */
    constructor(options) {
        super();
        this._isDisposed = false;
        this._scrollGuard = true;
        this._scrollSignal = new signaling_1.Signal(this);
        this._mimetype = 'text/x-ipythongfm';
        this._disposables = new disposable_1.DisposableSet();
        this.addClass(CHATBOX_CLASS);
        // Create the panels that hold the content and input.
        const layout = (this.layout = new widgets_1.PanelLayout());
        this._content = new widgets_1.Panel();
        this._input = new widgets_1.Panel();
        this.contentFactory = options.contentFactory;
        this._rendermime = options.rendermime;
        // Add top-level CSS classes.
        this._content.addClass(CONTENT_CLASS);
        this._input.addClass(INPUT_CLASS);
        // Insert the content and input panes into the widget.
        layout.addWidget(this._content);
        layout.addWidget(this._input);
        // Throttle the scroll paging of the widget.
        this._monitor = new coreutils_2.ActivityMonitor({
            signal: this._scrollSignal,
            timeout: SCROLL_THROTTLE
        });
        this._monitor.activityStopped.connect(this._handleScroll, this);
    }
    /**
     * Whether the chatbox has been disposed.
     */
    get isDisposed() {
        return this._isDisposed;
    }
    /*
     * The chatbox input prompt.
     */
    get prompt() {
        const inputLayout = this._input.layout;
        return inputLayout.widgets[0];
    }
    /**
     * The document model associated with the chatbox.
     */
    get model() {
        return this._model;
    }
    set model(model) {
        // Do nothing if it is the same model.
        if (model === this._model) {
            return;
        }
        // Clean up after the previous model.
        if (this._log) {
            this._log.changed.disconnect(this._onLogChanged, this);
        }
        this.clear();
        // Set the new model.
        this._model = model;
        if (!this._model) {
            this._log = undefined;
            return;
        }
        // Populate with the new model values.
        const modelDB = this._model.modelDB;
        modelDB.connected.then(() => {
            // Update the chatlog vector.
            modelDB.createList('internal:chat');
            this._log = modelDB.get('internal:chat');
            this._log.changed.connect(this._onLogChanged, this);
            this._start = this._log.length;
            if (this.isVisible) {
                this._scrollGuard = true;
                this._addPage(PAGE_LENGTH);
                Private.scrollToBottom(this._content.node);
                this._scrollGuard = false;
            }
        });
    }
    /**
     * The log of chat entries for the current document model.
     */
    get log() {
        return this._log;
    }
    /**
     * The list of currently rendered widgets for the chatbox.
     */
    get widgets() {
        return this._content.widgets;
    }
    /**
     * Clear the chat entries.
     */
    clear() {
        // Dispose all the content cells.
        const entries = this._content.widgets;
        while (entries.length) {
            entries[0].dispose();
        }
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        // Do nothing if already disposed.
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        this._disposables.dispose();
        this._log = undefined;
        signaling_1.Signal.clearData(this);
        super.dispose();
    }
    /**
     * Post the current text in the prompt to the chat.
     */
    post() {
        if (!this._model || !this._log) {
            return;
        }
        const prompt = this.prompt;
        if (prompt.model.value.text.trim() !== '') {
            this._post();
            this._newPrompt();
        }
        else {
            return;
        }
    }
    /**
     * Insert a line break in the prompt.
     */
    insertLinebreak() {
        const prompt = this.prompt;
        const model = prompt.model;
        const editor = prompt.editor;
        // Insert the line break at the cursor position, and move cursor forward.
        let pos = editor.getCursorPosition();
        const offset = editor.getOffsetAt(pos);
        const text = model.value.text;
        model.value.text = text.substr(0, offset) + '\n' + text.substr(offset);
        // pos should be well defined, since we have inserted a character.
        pos = editor.getPositionAt(offset + 1);
        editor.setCursorPosition(pos);
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the notebook panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'keydown':
                this._evtKeyDown(event);
                break;
            case 'mousedown':
                this._evtMouseDown(event);
                break;
            case 'mouseup':
                this._evtMouseup(event);
                break;
            case 'mousemove':
                this._evtMousemove(event);
                break;
            case 'scroll':
                this._scrollSignal.emit(void 0);
                break;
            default:
                break;
        }
    }
    /**
     * Handle `after_show` messages for the widget.
     */
    onAfterShow(msg) {
        // Put entries on the screen if we have
        // not yet done that.
        if (this._log && this._start === this._log.length) {
            this._scrollGuard = true;
            // Remove any existing widgets.
            this.clear();
            // Add a page.
            this._addPage(PAGE_LENGTH);
            // Scroll to bottom.
            Private.scrollToBottom(this._content.node);
            this._scrollGuard = false;
        }
    }
    /**
     * Handle `after_attach` messages for the widget.
     */
    onAfterAttach(msg) {
        const node = this.node;
        node.addEventListener('keydown', this, true);
        node.addEventListener('mousedown', this);
        this._content.node.addEventListener('scroll', this);
        // Create a prompt if necessary.
        if (!this.prompt) {
            this._newPrompt();
        }
        else {
            this.prompt.editor.focus();
            this.update();
        }
    }
    /**
     * Handle `before-detach` messages for the widget.
     */
    onBeforeDetach(msg) {
        const node = this.node;
        node.removeEventListener('keydown', this, true);
        node.removeEventListener('mousedown', this);
        this._content.node.removeEventListener('scroll', this);
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        this.prompt.editor.focus();
        this.update();
    }
    /**
     * Handle `update-request` messages.
     */
    onUpdateRequest(msg) {
        Private.scrollToBottom(this._content.node);
    }
    /**
     * Make a new prompt.
     */
    _newPrompt() {
        let prompt = this.prompt;
        // Create the new prompt.
        const factory = this.contentFactory;
        const options = this._createMarkdownCellOptions();
        prompt = factory.createCell(options);
        prompt.model.mimeType = this._mimetype;
        prompt.addClass(PROMPT_CLASS);
        prompt.rendered = false;
        this._input.addWidget(prompt);
        if (this.isAttached) {
            this.activate();
        }
    }
    /**
     * Add another page of entries.
     */
    _addPage(count) {
        // Do nothing if there is no log, or if we
        // are already rendering the whole log.
        if (!this._log || this._start === 0) {
            return;
        }
        // Add `count` widgets to the panel.
        let index = this._start - 1;
        let numAdded = 0;
        while (index >= 0 && numAdded < count) {
            const entryWidget = this._entryWidgetFromModel(this._log.get(index--));
            this._content.insertWidget(0, entryWidget);
            numAdded++;
        }
        this._start = index + 1;
    }
    /**
     * Handle a `'scroll'` event for the content panel.
     */
    _handleScroll() {
        // If we are adding entries right now,
        // ignore any scroll event.
        if (this._scrollGuard) {
            return;
        }
        // Only page if we hit the top.
        if (this._content.node.scrollTop <= NEW_PAGE_POSITION && this._start > 0) {
            const startingHeight = this._content.node.scrollHeight;
            const startingPosition = this._content.node.scrollTop;
            this._addPage(PAGE_LENGTH);
            // Attempt to place the scroll position at
            // same entry where we started.
            this._content.node.scrollTop =
                this._content.node.scrollHeight - startingHeight + startingPosition;
        }
    }
    /**
     * Handle the `'keydown'` event for the widget.
     */
    _evtKeyDown(event) {
        const editor = this.prompt.editor;
        if (event.keyCode === 13 && !editor.hasFocus()) {
            event.preventDefault();
            editor.focus();
        }
    }
    /**
     * Find the chat entry containing the target html element.
     *
     * #### Notes
     * Returns -1 if the entry is not found.
     */
    _findEntry(node) {
        // Trace up the DOM hierarchy to find the root cell node.
        // Then find the corresponding child and select it.
        while (node && node !== this.node) {
            if (node.classList.contains(entry_1.CHAT_ENTRY_CLASS)) {
                let i = algorithm_1.ArrayExt.findFirstIndex(this._content.widgets, widget => widget.node === node);
                if (i !== -1) {
                    return i;
                }
                break;
            }
            // Do a safe cast since we are checking for null
            // in the loop above.
            node = node.parentElement;
        }
        return -1;
    }
    /**
     * Handle `mousedown` events for the widget.
     */
    _evtMouseDown(event) {
        const target = event.target;
        const i = this._findEntry(target);
        // Left mouse press for drag start.
        if (event.button === 0 && i !== -1) {
            this._dragData = {
                pressX: event.clientX,
                pressY: event.clientY,
                index: i
            };
            document.addEventListener('mouseup', this, true);
            document.addEventListener('mousemove', this, true);
            event.preventDefault();
        }
    }
    /**
     * Handle the `'mouseup'` event for the widget.
     */
    _evtMouseup(event) {
        if (event.button !== 0 || !this._drag) {
            document.removeEventListener('mousemove', this, true);
            document.removeEventListener('mouseup', this, true);
            return;
        }
        event.preventDefault();
        event.stopPropagation();
    }
    /**
     * Handle the `'mousemove'` event for the widget.
     */
    _evtMousemove(event) {
        event.preventDefault();
        event.stopPropagation();
        // Bail if we are the one dragging.
        if (this._drag) {
            return;
        }
        // Check for a drag initialization.
        const data = this._dragData;
        const dx = Math.abs(event.clientX - data.pressX);
        const dy = Math.abs(event.clientY - data.pressY);
        if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
            return;
        }
        this._startDrag(data.index, event.clientX, event.clientY);
    }
    /**
     * Start a drag event.
     */
    _startDrag(index, clientX, clientY) {
        const toCopy = this._content.widgets[index];
        const data = [toCopy.cell.model.toJSON()];
        // Create the drag image.
        const dragImage = Private.createDragImage();
        // Set up the drag event.
        this._drag = new dragdrop_1.Drag({
            mimeData: new coreutils_1.MimeData(),
            supportedActions: 'copy',
            proposedAction: 'copy',
            dragImage,
            source: this
        });
        this._drag.mimeData.setData(JUPYTER_CELL_MIME, data);
        // Remove mousemove and mouseup listeners and start the drag.
        document.removeEventListener('mousemove', this, true);
        document.removeEventListener('mouseup', this, true);
        this._drag.start(clientX, clientY).then(action => {
            if (this.isDisposed) {
                return;
            }
            this._drag = null;
        });
    }
    /**
     * Update the chat view after a change in the log vector.
     */
    _onLogChanged(log, args) {
        let index = 0;
        const layout = this._content.layout;
        switch (args.type) {
            case 'add':
                index = args.newIndex;
                if (index < this._start) {
                    // If it is inserted before the view,
                    // just update the `_start` index.
                    this._start += args.newValues.length;
                }
                else {
                    // Otherwise insert the widgets into the view.
                    algorithm_1.each(args.newValues, entry => {
                        const entryWidget = this._entryWidgetFromModel(entry);
                        layout.insertWidget(index++, entryWidget);
                    });
                }
                break;
            case 'remove':
                index = args.oldIndex;
                if (index < this._start) {
                    // If the removal is before the view,
                    // just update the `_start` index.
                    this._start -= args.oldValues.length;
                }
                else {
                    // Otherwise remove the widgets from the view.
                    algorithm_1.each(args.oldValues, entry => {
                        const widget = layout.widgets[args.oldIndex];
                        widget.parent = null;
                        widget.dispose();
                    });
                }
                break;
            case 'move':
                if (args.newIndex >= this._start && args.oldIndex >= this._start) {
                    // If both are in the view, it is a straightforward move.
                    const fromIndex = args.oldIndex - this._start;
                    const toIndex = args.newIndex - this._start;
                    layout.insertWidget(toIndex, layout.widgets[fromIndex]);
                }
                else if (args.newIndex >= this._start) {
                    // If it is moving into the view, create the widget and
                    // update the `_start` index.
                    const entry = args.oldValues[0];
                    const entryWidget = this._entryWidgetFromModel(entry);
                    layout.insertWidget(args.newIndex - this._start, entryWidget);
                    this._start--;
                }
                else if (args.oldIndex >= this._start) {
                    // If it is moving out of the view, remove the widget
                    // and update the `_start index.`
                    const widget = layout.widgets[args.oldIndex - this._start];
                    widget.parent = null;
                    this._start++;
                }
                // If both are before `_start`, this is a no-op.
                break;
            case 'set':
                index = args.newIndex;
                if (index >= this._start) {
                    // Only need to update the widgets if they are in the view.
                    algorithm_1.each(args.newValues, entry => {
                        const entryWidget = this._entryWidgetFromModel(entry);
                        layout.insertWidget(index, entryWidget);
                        const toRemove = layout.widgets[index + 1];
                        toRemove.parent = null;
                        index++;
                    });
                }
                break;
            default:
                break;
        }
        this.update();
    }
    /**
     * Post the text current prompt.
     */
    _post() {
        // Dispose of the current input widget.
        const prompt = this.prompt;
        this._input.layout.widgets[0].parent = null;
        // Add the chat entry to the log. It is safe to check for
        // this._model and this._log , as that has been done in this.post().
        const collaborators = this._model.modelDB.collaborators;
        if (!collaborators) {
            throw Error('Cannot post chat entry to non-collaborative document.');
        }
        this._log.push({
            text: prompt.model.value.text,
            author: collaborators.localCollaborator
        });
        prompt.dispose();
    }
    /**
     * Given a chat entry model, create a new entry widget.
     */
    _entryWidgetFromModel(entry) {
        const options = this._createMarkdownCellOptions(entry.text);
        const cellWidget = this.contentFactory.createCell(options);
        this._disposables.add(cellWidget);
        cellWidget.readOnly = true;
        cellWidget.rendered = true;
        const isMe = this._model
            ? this._model.modelDB.collaborators.localCollaborator.userId ===
                entry.author.userId
            : false;
        const entryWidget = new entry_1.ChatEntry({
            model: entry,
            cell: cellWidget,
            isMe
        });
        return entryWidget;
    }
    /**
     * Create the options used to initialize markdown cell widget.
     */
    _createMarkdownCellOptions(text = '') {
        const contentFactory = this.contentFactory.markdownCellContentFactory;
        const model = new cells_1.MarkdownCellModel({});
        this._disposables.add(model);
        const rendermime = this._rendermime;
        model.value.text = text || '';
        return { model, rendermime, contentFactory };
    }
}
exports.Chatbox = Chatbox;
/**
 * A namespace for Chatbox statics.
 */
(function (Chatbox) {
    /**
     * Default implementation of `IContentFactory`.
     */
    class ContentFactory {
        /**
         * Create a new content factory.
         */
        constructor(options) {
            this.editorFactory = options.editorFactory;
            this.markdownCellContentFactory = new cells_1.MarkdownCell.ContentFactory({
                editorFactory: this.editorFactory
            });
        }
        /**
         * Create a new prompt widget.
         */
        createCell(options) {
            return new cells_1.MarkdownCell(options);
        }
    }
    Chatbox.ContentFactory = ContentFactory;
})(Chatbox = exports.Chatbox || (exports.Chatbox = {}));
/**
 * A namespace for chatbox widget private data.
 */
var Private;
(function (Private) {
    /**
     * Jump to the bottom of a node.
     *
     * @param node - The scrollable element.
     */
    function scrollToBottom(node) {
        node.scrollTop = node.scrollHeight - node.clientHeight;
    }
    Private.scrollToBottom = scrollToBottom;
})(Private || (Private = {}));
/**
 * A namespace for private data.
 */
(function (Private) {
    /**
     * Create a chat entry drag image.
     */
    function createDragImage() {
        const node = document.createElement('div');
        const span = document.createElement('span');
        span.textContent = '1';
        span.className = FILLED_CIRCLE_CLASS;
        node.appendChild(span);
        node.className = DRAG_IMAGE_CLASS;
        return node;
    }
    Private.createDragImage = createDragImage;
})(Private || (Private = {}));
