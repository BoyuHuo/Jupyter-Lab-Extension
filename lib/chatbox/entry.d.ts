import { Widget } from '@phosphor/widgets';
import { JSONObject } from '@phosphor/coreutils';
import { ICollaborator } from '@jupyterlab/observables';
import { MarkdownCell } from '@jupyterlab/cells';
/**
 * The class name added to the chatbox entries.
 */
export declare const CHAT_ENTRY_CLASS = "jp-ChatEntry";
/**
 * A chat entry widget, which hosts a user badge and a markdown cell.
 */
export declare class ChatEntry extends Widget {
    /**
     * Construct a chat entry widget.
     */
    constructor(options: ChatEntry.IOptions);
    /**
     * Get the underlying model for the entry.
     */
    readonly model: ChatEntry.IModel;
    /**
     * The underlying cell widget for the entry.
     */
    readonly cell: MarkdownCell;
    private _badge;
}
/**
 * The namespace for `InputAreaWidget` statics.
 */
export declare namespace ChatEntry {
    /**
     * Options for creating a chat entry widget.
     */
    interface IOptions {
        /**
         * A chat entry model for the widget.
         */
        model: IModel;
        /**
         * A markdown widget for rendering the entry.
         */
        cell: MarkdownCell;
        /**
         * Whether this author is the local collaborator.
         */
        isMe: boolean;
    }
    /**
     * An interface for an entry in the chat log.
     */
    interface IModel extends JSONObject {
        /**
         * The text of the chat entry.
         */
        text: string;
        /**
         * The collaborator who logged the entry.
         */
        author: ICollaborator;
    }
}
