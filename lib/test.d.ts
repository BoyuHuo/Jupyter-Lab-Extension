import { Widget } from '@phosphor/widgets';
import { Message } from '@phosphor/messaging';
export declare class TestWidget extends Widget {
    constructor();
    /**
     * The image element associated with the widget.
     */
    readonly img: HTMLImageElement;
    /**
     * Handle update requests for the widget.
     */
    onUpdateRequest(msg: Message): void;
}
