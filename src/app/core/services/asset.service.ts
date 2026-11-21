import { inject, Injectable } from '@angular/core';
import { BrandSlot } from '../contracts/api';
import { ConfigService } from './config.service';
import { NetworkService } from './network.service';

/**
 * Resolves static UI images that now live on the backend (served at
 * `/assets/...`) instead of being bundled with the frontend. Pass a path
 * relative to the assets root, with or without a leading `assets/`.
 */
@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly config = inject(ConfigService);
  private readonly network = inject(NetworkService);

  brand(slot: BrandSlot): string {
    const defaults: Record<BrandSlot, string> = { logo: 'misc/logo.png', 'logo-long': 'misc/legion.png', placeholder: 'misc/placeholder.png', background: '' };
    const url = this.config.ui()?.brand[slot];
    if (!url) return defaults[slot] ? this.image(defaults[slot]) : '';
    return /^(https?:|data:|blob:)/i.test(url) ? url : `${this.network.apiBase()}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  image(path: string): string {
    const clean = path.replace(/^\/?(assets\/)?/, '');
    return `${this.network.apiBase()}/assets/${clean}`;
  }
}
