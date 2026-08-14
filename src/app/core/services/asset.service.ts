import { inject, Injectable } from '@angular/core';
import { NetworkService } from './network.service';

/**
 * Resolves static UI images that now live on the backend (served at
 * `/assets/...`) instead of being bundled with the frontend. Pass a path
 * relative to the assets root, with or without a leading `assets/`.
 */
@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly network = inject(NetworkService);

  image(path: string): string {
    const clean = path.replace(/^\/?(assets\/)?/, '');
    return `${this.network.apiBase()}/assets/${clean}`;
  }
}
