import { inject, Injectable } from '@angular/core';
import { API_PATHS } from '../contracts/api';
import { SessionService } from './session.service';
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
  private readonly session = inject(SessionService);
  private readonly network = inject(NetworkService);
  private readonly assets = inject(AssetService);

  /** Backend-hosted placeholder shown when a media name is empty. */
  get placeholder(): string {
    return this.assets.brand('placeholder');
  }

  /** URL for a media file of a round; placeholder when the name is empty. */
  resolve(kind: RoundKind | 'misc', fileName: string | undefined | null): string {
    if (!fileName) return this.placeholder;
    const room = this.session.roomId();
    return `${this.network.apiBase()}${room ? API_PATHS.roomMediaFile(room, kind, fileName) : API_PATHS.mediaFile(kind, fileName)}`;
  }
}
