import { Injectable } from '@angular/core';
import { IEditorData } from '../../interfaces/editor.interface';
import JSZip from 'jszip';
import { EditorDataService } from './editor.data.service';
@Injectable({
  providedIn: 'root'
})
export class FsService {
  private opfsRoot: Promise<FileSystemDirectoryHandle> = navigator.storage.getDirectory();
  constructor(
  ) {

  }

  /**
   *
   * @param file File to write to the OPFS.
   * @param directory Relative directory from the root of the OPFS.
   * @returns {string} Blob URL of the file.
   */
  public async writeLocalFile(file: Blob, directory: string): Promise<string> {
    const fsObject = ((await (await this.opfsRoot).getFileHandle(directory, { create: true })));
    const writeStream = (await fsObject.createWritable());
    await writeStream.write(file);
    await writeStream.close();
    return URL.createObjectURL((await fsObject.getFile()));
  }


  /**
   *
   * @param directory The directory relative to the root of the OPFS.
   * @returns The Blob URL of specified file.
   */
  public async getBlobUrl(directory: string): Promise<string> {
    const fsObject = ((await (await this.opfsRoot).getFileHandle(directory)));
    return URL.createObjectURL((await fsObject.getFile()));
  }

  /**
   *
   */
  public async getFile(directory: string): Promise<File> {
    const fsObject = ((await (await this.opfsRoot).getFileHandle(directory)));
    return (await fsObject.getFile());
  }
}
