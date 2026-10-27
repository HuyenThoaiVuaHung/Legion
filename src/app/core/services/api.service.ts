import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  API_PATHS, AccountCredentials, AccountProfile, AccountSession, AccountSessionWithRecovery, RecoverAccountRequest, ServerInfo, SessionResponse, JoinRoomRequest, JoinRoomResponse, JoinLinkRequest, CreateRoomResponse, RoomInfo, RoomSecrets, RoomSettingsRequest, CreateRoomLinkRequest, CreateRoomLinkResponse, RoomLink, BankItem, BrandSlot,
  BrandAssetKey,
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
import { STORAGE_KEYS } from '../constants';
import { PublicConfig } from './config.service';
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

  private accountHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.accountToken) ?? ''}` });
  }
  serverInfo(): Promise<ServerInfo> { return firstValueFrom(this.http.get<ServerInfo>(this.url(API_PATHS.server))); }
  session(): Promise<SessionResponse> { return firstValueFrom(this.http.get<SessionResponse>(this.url(API_PATHS.session))); }
  signup(body: AccountCredentials): Promise<AccountSessionWithRecovery> { return firstValueFrom(this.http.post<AccountSessionWithRecovery>(this.url(API_PATHS.signup), body)); }
  accountLogin(body: AccountCredentials): Promise<AccountSession> { return firstValueFrom(this.http.post<AccountSession>(this.url(API_PATHS.accountLogin), body)); }
  recoverAccount(body: RecoverAccountRequest): Promise<AccountSessionWithRecovery> { return firstValueFrom(this.http.post<AccountSessionWithRecovery>(this.url(API_PATHS.recoverAccount), body)); }
  accountLogout(): Promise<void> { return firstValueFrom(this.http.post<void>(this.url(API_PATHS.accountLogout), {}, { headers: this.accountHeaders() })); }
  me(): Promise<AccountProfile> { return firstValueFrom(this.http.get<AccountProfile>(this.url(API_PATHS.me), { headers: this.accountHeaders() })); }
  createRoom(bankItemId?: string): Promise<CreateRoomResponse> { return firstValueFrom(this.http.post<CreateRoomResponse>(this.url(API_PATHS.rooms), bankItemId ? { bankItemId } : {}, { headers: this.accountHeaders() })); }
  enterRoom(id: string): Promise<JoinRoomResponse> { return firstValueFrom(this.http.post<JoinRoomResponse>(this.url(API_PATHS.enterRoom(id)), {}, { headers: this.accountHeaders() })); }
  joinRoom(body: JoinRoomRequest): Promise<JoinRoomResponse> { return firstValueFrom(this.http.post<JoinRoomResponse>(this.url(API_PATHS.joinRoom), body)); }
  joinLink(body: JoinLinkRequest): Promise<JoinRoomResponse> { return firstValueFrom(this.http.post<JoinRoomResponse>(this.url(API_PATHS.joinLink), body)); }
  currentRoom(): Promise<RoomInfo> { return firstValueFrom(this.http.get<RoomInfo>(this.url(API_PATHS.currentRoom))); }
  closeRoom(): Promise<void> { return firstValueFrom(this.http.delete<void>(this.url(API_PATHS.currentRoom))); }
  rotateSecret(role: keyof RoomSecrets): Promise<RoomSecrets> { return firstValueFrom(this.http.post<RoomSecrets>(this.url(API_PATHS.rotateSecret), { role })); }
  releaseSeat(index: number): Promise<void> { return firstValueFrom(this.http.delete<void>(this.url(API_PATHS.releaseSeat(index)))); }
  transferRoom(username: string): Promise<void> { return firstValueFrom(this.http.post<void>(this.url(API_PATHS.transferRoom), { username })); }
  roomSettings(body: RoomSettingsRequest): Promise<RoomSettingsRequest> { return firstValueFrom(this.http.patch<RoomSettingsRequest>(this.url(API_PATHS.roomSettings), body)); }
  roomLinks(): Promise<RoomLink[]> { return firstValueFrom(this.http.get<RoomLink[]>(this.url(API_PATHS.roomLinks))); }
  createRoomLink(body: CreateRoomLinkRequest): Promise<CreateRoomLinkResponse> { return firstValueFrom(this.http.post<CreateRoomLinkResponse>(this.url(API_PATHS.roomLinks), body)); }
  deleteRoomLink(id: string): Promise<void> { return firstValueFrom(this.http.delete<void>(this.url(API_PATHS.roomLink(id)))); }
  saveToBank(body: { name?: string; bankItemId?: string }): Promise<BankItem> { return firstValueFrom(this.http.post<BankItem>(this.url(API_PATHS.saveToBank), body)); }
  bank(): Promise<{ items: BankItem[]; usedBytes: number; maxBytes: number; maxItems: number }> { return firstValueFrom(this.http.get<{ items: BankItem[]; usedBytes: number; maxBytes: number; maxItems: number }>(this.url(API_PATHS.bank), { headers: this.accountHeaders() })); }
  uploadBank(file: File): Promise<BankItem> { const form = new FormData(); form.append(UPLOAD_FIELD, file); return firstValueFrom(this.http.post<BankItem>(this.url(API_PATHS.bank), form, { headers: this.accountHeaders() })); }
  downloadBank(id: string): Promise<Blob> { return firstValueFrom(this.http.get(this.url(API_PATHS.bankItem(id)), { headers: this.accountHeaders(), responseType: 'blob' })); }
  renameBank(id: string, name: string): Promise<BankItem> { return firstValueFrom(this.http.patch<BankItem>(this.url(API_PATHS.bankItem(id)), { name }, { headers: this.accountHeaders() })); }
  deleteBank(id: string): Promise<void> { return firstValueFrom(this.http.delete<void>(this.url(API_PATHS.bankItem(id)), { headers: this.accountHeaders() })); }
  uploadBrand(slot: BrandSlot, file: File): Promise<PublicConfig> { const form = new FormData(); form.append(UPLOAD_FIELD, file); return firstValueFrom(this.http.post<PublicConfig>(this.url(API_PATHS.brand(slot)), form)); }
  deleteBrand(slot: BrandSlot): Promise<PublicConfig> { return firstValueFrom(this.http.delete<PublicConfig>(this.url(API_PATHS.brand(slot)))); }

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

  /** Replace a mutable Legion brand asset in the backend override layer. */
  uploadBrandAsset(key: BrandAssetKey, file: File): Promise<MediaUploadResponse> {
    const form = new FormData();
    form.append(UPLOAD_FIELD, file);
    return firstValueFrom(
      this.http.post<MediaUploadResponse>(this.url(API_PATHS.brandAsset(key)), form),
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
