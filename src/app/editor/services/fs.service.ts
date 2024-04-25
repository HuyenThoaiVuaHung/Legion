import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FsService {
  constructor() {

  }
  public async writeFile(file: Blob, directory: string){
    const opfsRoot = await navigator.storage.getDirectory();
    (await (await opfsRoot.getFileHandle(directory)).createWritable()).write(file);
  }
}
