import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { FsService } from './fs.service';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor(
    private fs: FsService
  ) { }
  public async downloadEditorData(uid: string): Promise<void> {

  }
}
