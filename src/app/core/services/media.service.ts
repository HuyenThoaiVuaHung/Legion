import { inject, Injectable } from '@angular/core';
import { RoundKind } from '../contracts/game';
import { AssetService } from './asset.service';
import { NetworkService } from './network.service';

/**
 * Resolves question-media file names to server URLs. The server falls back
 * to the backend-hosted question-image folders, so plain file names from old
 * match data keep working through the same endpoint.
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly network = inject(NetworkService);
  private readonly assets = inject(AssetService);

  /** Backend-hosted placeholder shown when a media name is empty. */
  get placeholder(): string {
    return this.assets.image('misc/placeholder.png');
  }

  /** URL for a media file of a round; placeholder when the name is empty. */
  resolve(kind: RoundKind | 'misc', fileName: string | undefined | null): string {
    if (!fileName) return this.placeholder;
    return `${this.network.apiBase()}/media/${kind}/${encodeURIComponent(fileName)}`;
  }
}
