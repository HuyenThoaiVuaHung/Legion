import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { FsService } from './fs.service';
import { saveAs } from 'file-saver';
import { EditorMediaService } from './editor.media.service';
import { EditorDataService } from './editor.data.service';
import { IEditorData } from '../../interfaces/config.interface';
@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor(
    private editorMediaService: EditorMediaService,
    private editorDataService: EditorDataService,
    private fs: FsService
  ) { }
  public async downloadEditorData(uid: string): Promise<void> {
    const editorData = await this.editorDataService.loadLocalEditorData(uid);
    const zip = new JSZip();
    // Handle question bank media
    await this.editorMediaService.resolveQuestionBankMediaSrc(editorData.questionBank, editorData.uid, editorData.matchData.matchVersion,
      async (media: File, kind: string) => {
        zip.file(`${kind}/${media.name}`, await media.arrayBuffer());
        console.log('Question bank media added to Zip');
      }
    );
    await this.editorMediaService.resolveMiscMediaSrc(editorData.uid, editorData.uiConfig.miscImageSrcNames,
      async (media: File, kind: string) => {
        zip.file(`${kind}/${media.name}`, await media.arrayBuffer());
        console.log('Question bank media added to Zip');
      }
    )
    zip.file('editorData.json', JSON.stringify(editorData));
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${editorData.matchData.matchName}.lg`);
  }
  public async loadEditorData(file: File): Promise<void> {
    const zip = new JSZip();
    await zip.loadAsync(file);
    const editorData = JSON.parse(await zip.file('editorData.json')!.async('text')) as IEditorData;
    editorData.uid = crypto.randomUUID();
    await this.editorDataService.saveLocalEditorData(editorData);
    for (const file of Object.values(zip.files)) {
      if (file.name !== 'editorData.json' && file.dir === false) {
        const media = await file.async('blob');
        this.fs.writeLocalFile(media, `/${editorData.uid}/${file.name}`)
      }
    }
  }
}
