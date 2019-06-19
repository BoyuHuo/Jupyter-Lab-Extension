import { Widget } from '@phosphor/widgets';

//import { Client } from "minio";
//import Minio = require('minio')

/**
 * Google Drive filebrowser plugin state namespace.
 */
export const NAMESPACE = 'google-drive-filebrowser';

/**
 * Widget for hosting the Google Drive filebrowser.
 */
export class NebulaFileBrowser extends Widget {
  constructor() {
    super();
    this.img = document.createElement('img');
    this.img.className = 'jp-xkcdCartoon';
    this.div = document.createElement('div');
    this.div.textContent = 'http://192.168.88.119:9000';
    this.div.setAttribute('class', 'note');
    this.node.appendChild(this.img);
    this.node.appendChild(this.div);

    this.img.insertAdjacentHTML(
      'afterend',
      `<div class="jp-xkcdAttribution">
            <a href="https://creativecommons.org/licenses/by-nc/2.5/" class="jp-xkcdAttribution" target="_blank">
              <img src="https://licensebuttons.net/l/by-nc/2.5/80x15.png" />
            </a>
          </div>`
    );

    var Minio = require('minio');

    const s3Client = new Minio.Client({
      endPoint: '192.168.88.119',
      port: 9000,
      useSSL: false,
      accessKey: 'test',
      secretKey: 'testtest'
    });

    s3Client.listBuckets(function(err: Error, buckets: any) {
      if (err) return console.log(err);
      console.log('buckets :', buckets);
    });
  }

  readonly img: HTMLImageElement;
  readonly div: HTMLDivElement;
}
