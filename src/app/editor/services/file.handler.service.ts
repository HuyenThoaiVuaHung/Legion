import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { FsService } from './fs.service';
import { EditorMediaService } from './editor.media.service';
import { EditorDataService } from './editor.data.service';
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
      }
    );
    await this.editorMediaService.resolveMiscMediaSrc(editorData.uid, editorData.uiConfig.miscImageSrcNames,
      async (media: File, kind: string) => {
        zip.file(`${kind}/${media.name}`, await media.arrayBuffer());
      }
    )
    zip.file('editorData.json', this.editorDataService.serializeEditorData(editorData));
    const blob = await zip.generateAsync({ type: 'blob' });
    this.saveBlob(blob, `${editorData.matchData.matchName}.legion`);
  }
  public async loadEditorData(file: File): Promise<void> {
    const zip = new JSZip();
    await zip.loadAsync(file);
    const editorData = this.editorDataService.normalizeEditorData(
      JSON.parse(await zip.file('editorData.json')!.async('text'))
    );
    editorData.uid = crypto.randomUUID();
    await this.editorDataService.saveLocalEditorData(editorData);
    for (const file of Object.values(zip.files)) {
      if (file.name !== 'editorData.json' && file.dir === false && !file.name.split('/').includes('..')) {
        const media = await file.async('blob');
        await this.fs.writeLocalFile(media, `/${editorData.uid}/${file.name}`)
      }
    }
  }
  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}
