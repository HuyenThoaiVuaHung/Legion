import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  API_PATHS,
  LegionImportResponse,
  LoginResponse,
  MediaUploadResponse,
  UPLOAD_FIELD,
  UpdateKdControlRequest,
} from '../contracts/api';
import {
  MatchPosition,
  MatchState,
  Player,
  RoundDataMap,
  RoundKind,
} from '../contracts/game';
import { NetworkService } from './network.service';

/** Typed client for the Legendary REST API. One method per endpoint. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly network = inject(NetworkService);

  private url(path: string): string {
    return `${this.network.apiBase()}${path}`;
  }

  login(secret?: string): Promise<LoginResponse> {
    return firstValueFrom(
      this.http.post<LoginResponse>(this.url(API_PATHS.login), { secret }),
    );
  }

  getMatch(): Promise<MatchState> {
    return firstValueFrom(this.http.get<MatchState>(this.url(API_PATHS.match)));
  }

  setPosition(position: MatchPosition): Promise<MatchState> {
    return firstValueFrom(
      this.http.patch<MatchState>(this.url(API_PATHS.matchPosition), { position }),
    );
  }

  updatePlayer(index: number, player: Player): Promise<MatchState> {
    return firstValueFrom(
      this.http.patch<MatchState>(this.url(API_PATHS.matchPlayer(index)), { player }),
    );
  }

  getRound<K extends RoundKind>(kind: K): Promise<RoundDataMap[K]> {
    return firstValueFrom(
      this.http.get<RoundDataMap[K]>(this.url(API_PATHS.round(kind))),
    );
  }

  putRound<K extends RoundKind>(kind: K, data: RoundDataMap[K]): Promise<RoundDataMap[K]> {
    return firstValueFrom(
      this.http.put<RoundDataMap[K]>(this.url(API_PATHS.round(kind)), data),
    );
  }

  patchKdControl(request: UpdateKdControlRequest): Promise<RoundDataMap['kd']> {
    return firstValueFrom(
      this.http.patch<RoundDataMap['kd']>(this.url(API_PATHS.round('kd')), request),
    );
  }

  uploadMedia(kind: RoundKind | 'misc', file: File): Promise<MediaUploadResponse> {
    const form = new FormData();
    form.append(UPLOAD_FIELD, file);
    return firstValueFrom(
      this.http.post<MediaUploadResponse>(this.url(API_PATHS.media(kind)), form),
    );
  }

  /** Uploads one cut VCNV obstacle piece to the protected store. */
  uploadObstaclePiece(piece: Blob, name: string): Promise<MediaUploadResponse> {
    const form = new FormData();
    form.append(UPLOAD_FIELD, piece, name);
    return firstValueFrom(
      this.http.post<MediaUploadResponse>(this.url(API_PATHS.obstaclePieceUpload), form),
    );
  }

  /** Reveal-gated URL for obstacle piece `index` (0-based). */
  obstaclePieceUrl(index: number): string {
    return this.url(API_PATHS.obstaclePiece(index));
  }

  importLegion(file: File): Promise<LegionImportResponse> {
    const form = new FormData();
    form.append(UPLOAD_FIELD, file);
    return firstValueFrom(
      this.http.post<LegionImportResponse>(this.url(API_PATHS.importLegion), form),
    );
  }

  /** Direct download URL for the current match as a .legion archive. */
  exportLegionUrl(): string {
    return this.url(API_PATHS.exportLegion);
  }

  importExcel(workbookJson: unknown): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(this.url('/api/match/import-excel'), workbookJson),
    );
  }
}
