import { inject, Injectable } from '@angular/core';
import { RoundKind } from '../contracts/game';
import { NetworkService } from './network.service';

export const PLACEHOLDER_IMAGE = 'assets/misc/placeholder.png';

/**
 * Resolves question-media file names to server URLs. The server falls back
 * to the bundled legacy asset folders, so plain file names from old match
 * data keep working through the same endpoint.
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly network = inject(NetworkService);

  /** URL for a media file of a round; placeholder when the name is empty. */
  resolve(kind: RoundKind | 'misc', fileName: string | undefined | null): string {
    if (!fileName) return PLACEHOLDER_IMAGE;
    return `${this.network.apiBase()}/media/${kind}/${encodeURIComponent(fileName)}`;
  }
}
