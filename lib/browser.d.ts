import { Widget } from '@phosphor/widgets';
/**
 * Google Drive filebrowser plugin state namespace.
 */
export declare const NAMESPACE = "google-drive-filebrowser";
/**
 * Widget for hosting the Google Drive filebrowser.
 */
export declare class NebulaFileBrowser extends Widget {
    constructor();
    readonly img: HTMLImageElement;
    readonly div: HTMLDivElement;
}
