import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Role, TokenPayload, JoinRoomResponse } from '../contracts/api';
import { MatchState } from '../contracts/game';
import { PLAYER_ROUTE_BY_POSITION, STORAGE_KEYS } from '../constants';
import { ApiService } from './api.service';
import { ConfigService, PublicConfig } from './config.service';
import { NetworkService } from './network.service';

const MATCH_UPDATE_EVENT = 'update-match-data';

/**
 * Session state: who we are, the live match, and position-driven navigation.
 * Login is REST (token), realtime sync is the socket handshake with that token.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(ApiService);
  private readonly config = inject(ConfigService);
  private readonly network = inject(NetworkService);
  private readonly router = inject(Router);

  readonly identity = signal<TokenPayload | null>(null);
  readonly multiRoom = signal(false);
  readonly serverReady = signal(false);
  readonly followMatch = signal(true);
  readonly roomId = computed(() => this.identity()?.roomId ?? null);
  readonly match = signal<MatchState | null>(null);

  readonly role = computed<Role | null>(() => this.identity()?.roleId ?? null);
  readonly playerIndex = computed(() => this.identity()?.index ?? null);
  readonly self = computed(() => {
    const index = this.playerIndex();
    return index === null ? null : (this.match()?.players[index] ?? null);
  });

  constructor() {
    // Players and viewers follow the match position automatically.
    // (Old code did admin navigation as a hidden side effect of a computed —
    // that was a bug; admin/mc navigate themselves.)
    effect(() => {
      const position = this.match()?.position;
      const role = this.role();
      if (!this.followMatch() || !position || position === 'H' || (role !== Role.Player && role !== Role.Viewer)) return;
      const route = PLAYER_ROUTE_BY_POSITION[position];
      if (route) void this.router.navigateByUrl(route);
    });

    const savedUrl = this.network.serverUrl();
    if (savedUrl) void this.connect(savedUrl).catch(() => undefined);
  }

  get token(): string | null {
    return localStorage.getItem(STORAGE_KEYS.authToken);
  }

  /** Connect (or reconnect) to a server; reuses a stored token when present. */
  async connect(url: string): Promise<void> {
    const previousUrl = this.network.serverUrl();
    if (previousUrl && previousUrl.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
      this.clearToken();
      localStorage.removeItem(STORAGE_KEYS.accountToken);
      this.identity.set(null);
    }
    this.serverReady.set(false);
    this.network.connect(url, this.token ?? undefined);
    this.multiRoom.set((await this.api.serverInfo()).multiRoom);
    this.serverReady.set(true);
    this.network.on<[MatchState]>(MATCH_UPDATE_EVENT, (match) => this.match.set(match));
    if (this.token) {
      // Restore identity from a previous login on this server.
      try {
        await this.refreshIdentityFromToken();
      } catch {
        this.clearToken();
      }
    }
    await this.config.load();
    this.network.on<[PublicConfig]>('update-config', (config) => this.config.apply(config));
    try { this.match.set(await this.api.getMatch()); } catch { this.match.set(null); }
  }

  /** Exchange a secret for a token, reconnect the socket with it. */
  async login(secret: string): Promise<Role> {
    const response = await this.api.login(secret);
    await this.acceptRoomSession(response);
    return response.roleId;
  }

  async acceptRoomSession(response: JoinRoomResponse | { token: string; roleId: Role; index?: number; roomId?: string }): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.roomToken, response.token);
    this.identity.set({ roleId: response.roleId, index: response.index, roomId: response.roomId });
    this.network.connect(this.network.serverUrl(), response.token);
    this.network.on<[MatchState]>(MATCH_UPDATE_EVENT, (match) => this.match.set(match));
    this.network.on<[PublicConfig]>('update-config', (config) => this.config.apply(config));
    await this.config.load();
    try { this.match.set(await this.api.getMatch()); } catch { this.match.set(null); }
  }

  /**
   * Drop any authenticated session and fall back to an anonymous viewer
   * connection. Idempotent: a no-op when already logged out, so repeated calls
   * (e.g. every visit to the home screen) don't churn the socket.
   */
  logout(): void {
    const wasAuthenticated = this.token !== null || this.identity() !== null;
    if (!wasAuthenticated) return;
    this.clearToken();
    this.identity.set(null);
    const url = this.network.serverUrl();
    if (url) {
      this.network.connect(url); // drop the authenticated socket, reconnect as viewer
      this.network.on<[MatchState]>(MATCH_UPDATE_EVENT, (match) => this.match.set(match));
    }
  }

  disconnect(): void {
    this.clearToken();
    this.identity.set(null);
    this.match.set(null);
    this.serverReady.set(false);
    this.network.disconnect();
  }

  private clearToken(): void {
    localStorage.removeItem(STORAGE_KEYS.authToken);
  }

  private async refreshIdentityFromToken(): Promise<void> {
    if (!this.token) return;
    this.identity.set(await this.api.session());
  }
}
