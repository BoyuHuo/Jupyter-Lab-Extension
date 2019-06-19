import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { Cell, MarkdownCell } from '@jupyterlab/cells';
import { IObservableList } from '@jupyterlab/observables';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { ChatEntry } from './entry';
/**
 * A widget containing a Jupyter chatbox.
 *
 * #### Notes
 * The Chatbox class is intended to be used within a ChatboxPanel
 * instance. Under most circumstances, it is not instantiated by user code.
 */
export declare class Chatbox extends Widget {
    /**
     * Construct a chatbox widget.
     */
    constructor(options: Chatbox.IOptions);
    /**
     * The content factory used by the chatbox.
     */
    readonly contentFactory: Chatbox.IContentFactory;
    /**
     * Whether the chatbox has been disposed.
     */
    readonly isDisposed: boolean;
    readonly prompt: MarkdownCell;
    /**
     * The document model associated with the chatbox.
     */
    model: DocumentRegistry.IModel | undefined;
    /**
     * The log of chat entries for the current document model.
     */
    readonly log: IObservableList<ChatEntry.IModel> | undefined;
    /**
     * The list of currently rendered widgets for the chatbox.
     */
    readonly widgets: ReadonlyArray<Widget>;
    /**
     * Clear the chat entries.
     */
    clear(): void;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    /**
     * Post the current text in the prompt to the chat.
     */
    post(): void;
    /**
     * Insert a line break in the prompt.
     */
    insertLinebreak(): void;
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
    handleEvent(event: Event): void;
    /**
     * Handle `after_show` messages for the widget.
     */
    protected onAfterShow(msg: Message): void;
    /**
     * Handle `after_attach` messages for the widget.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Handle `update-request` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Make a new prompt.
     */
    private _newPrompt;
    /**
     * Add another page of entries.
     */
    private _addPage;
    /**
     * Handle a `'scroll'` event for the content panel.
     */
    private _handleScroll;
    /**
     * Handle the `'keydown'` event for the widget.
     */
    private _evtKeyDown;
    /**
     * Find the chat entry containing the target html element.
     *
     * #### Notes
     * Returns -1 if the entry is not found.
     */
    private _findEntry;
    /**
     * Handle `mousedown` events for the widget.
     */
    private _evtMouseDown;
    /**
     * Handle the `'mouseup'` event for the widget.
     */
    private _evtMouseup;
    /**
     * Handle the `'mousemove'` event for the widget.
     */
    private _evtMousemove;
    /**
     * Start a drag event.
     */
    private _startDrag;
    /**
     * Update the chat view after a change in the log vector.
     */
    private _onLogChanged;
    /**
     * Post the text current prompt.
     */
    private _post;
    /**
     * Given a chat entry model, create a new entry widget.
     */
    private _entryWidgetFromModel;
    /**
     * Create the options used to initialize markdown cell widget.
     */
    private _createMarkdownCellOptions;
    private _isDisposed;
    private _rendermime;
    private _content;
    private _log;
    private _start;
    private _scrollGuard;
    private _monitor;
    private _scrollSignal;
    private _input;
    private _mimetype;
    private _model;
    private _disposables;
    private _drag;
    private _dragData;
}
/**
 * A namespace for Chatbox statics.
 */
export declare namespace Chatbox {
    /**
     * The initialization options for a chatbox widget.
     */
    interface IOptions {
        /**
         * The content factory for the chatbox widget.
         */
        contentFactory: IContentFactory;
        /**
         * The mime renderer for the chatbox widget.
         */
        rendermime: IRenderMimeRegistry;
    }
    /**
     * A content factory for chatbox children.
     */
    interface IContentFactory {
        /**
         * The editor factory.
         */
        readonly editorFactory: CodeEditor.Factory;
        /**
         * The factory for a markdown cell widget.
         */
        readonly markdownCellContentFactory: Cell.IContentFactory;
        /**
         * Create a new cell widget.
         */
        createCell(options: MarkdownCell.IOptions): MarkdownCell;
    }
    /**
     * Default implementation of `IContentFactory`.
     */
    class ContentFactory implements IContentFactory {
        /**
         * Create a new content factory.
         */
        constructor(options: IContentFactoryOptions);
        /**
         * The editor factory.
         */
        readonly editorFactory: CodeEditor.Factory;
        /**
         * The factory for a markdown cell widget.
         */
        readonly markdownCellContentFactory: Cell.IContentFactory;
        /**
         * Create a new prompt widget.
         */
        createCell(options: MarkdownCell.IOptions): MarkdownCell;
    }
    /**
     * An initialize options for `ContentFactory`.
     */
    interface IContentFactoryOptions {
        /**
         * The editor factory.
         */
        editorFactory: CodeEditor.Factory;
    }
}
