import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NetworkService } from './network.service';

/**
 * Runtime game knobs. Mirror of the backend `PublicConfig` served at
 * GET /api/config (keep the shapes in sync with legendary's
 * src/http/config.routes.ts + src/game.rules.ts).
 */
export interface GameRules {
  playerCount: number;
  mainClockTickMs: number;
  decisionTickMs: number;
  kdCorrectPoints: number;
  kdWrongPenalty: number;
  kdDecisionTicks: number;
  kdClockStartDelayMs: number;
  vcnvRowPoints: number;
  obstacleValueByRevealedCount: Record<number, number>;
  ttPointsByPlacement: number[];
  vdStealTicks: number;
  vdWrongPenaltyDivisor: number;
  vdHopeStarMultiplier: number;
  chpTurnSeconds: number;
  chpCorrectPoints: number;
}

export interface PublicConfig {
  rules: GameRules;
  playerCount: number;
  uploadLimitBytes: number;
}

/** Defaults used until the server config loads (and if it can't be reached). */
export const DEFAULT_RULES: GameRules = {
  playerCount: 4,
  mainClockTickMs: 1000,
  decisionTickMs: 100,
  kdCorrectPoints: 10,
  kdWrongPenalty: 5,
  kdDecisionTicks: 30,
  kdClockStartDelayMs: 1000,
  vcnvRowPoints: 10,
  obstacleValueByRevealedCount: { 0: 50, 1: 50, 2: 40, 3: 30, 4: 20, 5: 10 },
  ttPointsByPlacement: [40, 30, 20, 10],
  vdStealTicks: 50,
  vdWrongPenaltyDivisor: 2,
  vdHopeStarMultiplier: 2,
  chpTurnSeconds: 15,
  chpCorrectPoints: 1,
};

/** Fetches and caches the server's runtime knobs. */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly network = inject(NetworkService);

  readonly rules = signal<GameRules>(DEFAULT_RULES);
  readonly uploadLimitBytes = signal<number>(0);

  /** Load the config for the connected server; falls back to defaults. */
  async load(): Promise<void> {
    try {
      const config = await firstValueFrom(
        this.http.get<PublicConfig>(`${this.network.apiBase()}/api/config`),
      );
      this.rules.set(config.rules);
      this.uploadLimitBytes.set(config.uploadLimitBytes);
    } catch {
      this.rules.set(DEFAULT_RULES);
    }
  }
}
