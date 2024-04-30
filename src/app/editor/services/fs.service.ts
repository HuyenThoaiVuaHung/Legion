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

    const fsObject = await this.getFileHandle(directory);
    const writeStream = (await fsObject.createWritable());
    await writeStream.write(file);
    await writeStream.close();
    return URL.createObjectURL((await fsObject.getFile()));
  }

  public async deleteFile(directory: string): Promise<void> {
    const parentDir = await this.getDirectoryHandle(directory.split('/').slice(0, -1).join('/'));
    await parentDir.removeEntry(directory.split('/')[directory.split('/').length - 1]);
  }
  public async deleteDirectory(directory: string): Promise<void> {
    const parentDir = await this.getDirectoryHandle(directory.split('/').slice(0, -1).join('/'));
    await parentDir.removeEntry(directory.split('/')[directory.split('/').length - 1], { recursive: true });
  }

  /**
   *
   * @param directory The directory relative to the root of the OPFS.
   * @returns The Blob URL of specified file.
   */
  public async getBlobUrl(directory: string): Promise<string> {
    const fsObject = await this.getFileHandle(directory);
    return URL.createObjectURL((await fsObject.getFile()));
  }

  /**
   *
   */
  public async getFile(directory: string): Promise<File> {
    const fsObject = await this.getFileHandle(directory);
    return (await fsObject.getFile());
  }

  private async getFileHandle(directory: string): Promise<FileSystemFileHandle> {
    const tokens = directory.split('/');
    let workingDir = await this.opfsRoot;
    for (let i = 0; i < tokens.length - 2; i++) {
      workingDir = await workingDir.getDirectoryHandle(tokens[i], { create: true });
    }
    return await workingDir.getFileHandle(tokens[tokens.length - 1], { create: true });
  }
  private async getDirectoryHandle(directory: string): Promise<FileSystemDirectoryHandle> {
    const tokens = directory.split('/');
    let workingDir = await this.opfsRoot;
    for (let i = 0; i < tokens.length - 1; i++) {
      workingDir = await workingDir.getDirectoryHandle(tokens[i], { create: true });
    }
    return workingDir;
  }
}
