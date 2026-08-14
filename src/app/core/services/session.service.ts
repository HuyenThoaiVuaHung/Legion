import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Role, TokenPayload } from '../contracts/api';
import { MatchState } from '../contracts/game';
import { PLAYER_ROUTE_BY_POSITION, STORAGE_KEYS } from '../constants';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
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
      if (!position || (role !== Role.Player && role !== Role.Viewer)) return;
      const route = PLAYER_ROUTE_BY_POSITION[position];
      if (route) void this.router.navigateByUrl(route);
    });

    const savedUrl = this.network.serverUrl();
    if (savedUrl) void this.connect(savedUrl);
  }

  get token(): string | null {
    return localStorage.getItem(STORAGE_KEYS.authToken);
  }

  /** Connect (or reconnect) to a server; reuses a stored token when present. */
  async connect(url: string): Promise<void> {
    this.network.connect(url, this.token ?? undefined);
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
    this.match.set(await this.api.getMatch());
  }

  /** Exchange a secret for a token, reconnect the socket with it. */
  async login(secret: string): Promise<Role> {
    const response = await this.api.login(secret);
    localStorage.setItem(STORAGE_KEYS.authToken, response.token);
    this.identity.set({ roleId: response.roleId, index: response.index });
    this.network.connect(this.network.serverUrl(), response.token);
    this.network.on<[MatchState]>(MATCH_UPDATE_EVENT, (match) => this.match.set(match));
    return response.roleId;
  }

  logout(): void {
    this.clearToken();
    this.identity.set(null);
    const url = this.network.serverUrl();
    if (url) this.network.connect(url); // drop to viewer connection
    this.network.on<[MatchState]>(MATCH_UPDATE_EVENT, (match) => this.match.set(match));
  }

  disconnect(): void {
    this.clearToken();
    this.identity.set(null);
    this.match.set(null);
    this.network.disconnect();
  }

  private clearToken(): void {
    localStorage.removeItem(STORAGE_KEYS.authToken);
  }

  private async refreshIdentityFromToken(): Promise<void> {
    // The token is opaque to us; a viewer-visible endpoint that echoes the
    // role would be nicer, but decoding the JWT payload locally is enough
    // (display-only — the server enforces the real authorization).
    const token = this.token;
    if (!token) return;
    const [, payload] = token.split('.');
    if (!payload) throw new Error('malformed token');
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    this.identity.set({ roleId: decoded.roleId, index: decoded.index });
  }
}
