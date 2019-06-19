import { Panel, Widget } from '@phosphor/widgets';
import { Message } from '@phosphor/messaging';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { IRenderMimeRegistry } from '@jupyterlab/rendermime';
import { DocumentRegistry } from '@jupyterlab/docregistry';
import { Chatbox } from './chatbox';
/**
 * A panel which contains a chatbox and the ability to add other children.
 */
export declare class ChatboxPanel extends Panel {
    /**
     * Construct a chatbox panel.
     */
    constructor(options: ChatboxPanel.IOptions);
    /**
     * The chatbox widget used by the panel.
     */
    readonly chatbox: Chatbox;
    /**
     * The current document context for the chat.
     */
    context: DocumentRegistry.IContext<DocumentRegistry.IModel> | undefined;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Handle `'close-request'` messages.
     */
    protected onCloseRequest(msg: Message): void;
    private _documentInfo;
    private _context;
}
/**
 * A class representing a widget displaying document information
 * for the chatbox.
 */
export declare class ChatboxDocumentInfo extends Widget {
    constructor();
    /**
     * The current document context for the chat.
     */
    context: DocumentRegistry.IContext<DocumentRegistry.IModel> | undefined;
    /**
     * Handle a file moving/renaming.
     */
    private _onPathChanged;
    private _context;
}
/**
 * A namespace for ChatboxPanel statics.
 */
export declare namespace ChatboxPanel {
    /**
     * The initialization options for a chatbox panel.
     */
    interface IOptions {
        /**
         * The rendermime instance used by the panel.
         */
        rendermime: IRenderMimeRegistry;
        /**
         * The content factory for the panel.
         */
        contentFactory: IContentFactory;
    }
    /**
     * The chatbox panel renderer.
     */
    interface IContentFactory {
        /**
         * The editor factory used by the content factory.
         */
        readonly editorFactory: CodeEditor.Factory;
        /**
         * The factory for chatbox content.
         */
        readonly chatboxContentFactory: Chatbox.IContentFactory;
    }
    /**
     * Default implementation of `IContentFactory`.
     */
    class ContentFactory implements IContentFactory {
        /**
         * Create a new content factory.
         */
        constructor(options: ContentFactory.IOptions);
        /**
         * The editor factory used by the content factory.
         */
        readonly editorFactory: CodeEditor.Factory;
        /**
         * The factory for code chatbox content.
         */
        readonly chatboxContentFactory: Chatbox.IContentFactory;
    }
    /**
     * The namespace for `ContentFactory`.
     */
    namespace ContentFactory {
        /**
         * An initialization options for a chatbox panel factory.
         */
        interface IOptions {
            /**
             * The editor factory.  This will be used to create a
             * chatboxContentFactory if none is given.
             */
            editorFactory: CodeEditor.Factory;
            /**
             * The factory for chatbox widget content.  If given, this will
             * take precedence over the output area and cell factories.
             */
            chatboxContentFactory?: Chatbox.IContentFactory;
        }
    }
}
