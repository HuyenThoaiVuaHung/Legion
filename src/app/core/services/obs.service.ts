import { effect, inject, Injectable, signal } from '@angular/core';
import OBSWebSocket from 'obs-websocket-js';
import { STORAGE_KEYS } from '../constants';
import { MatchPosition } from '../contracts/game';
import { SessionService } from './session.service';

export const DEFAULT_OBS_URL = 'ws://localhost:4455';

/**
 * Drives OBS Studio over its WebSocket API (obs-websocket v5). Beyond manual
 * scene control, it can auto-switch the OBS program scene as the match moves
 * between rounds, so the stream's assets follow the game with no operator input.
 */
@Injectable({ providedIn: 'root' })
export class ObsService {
  private readonly session = inject(SessionService);
  private readonly obs = new OBSWebSocket();

  readonly connected = signal(false);
  readonly scenes = signal<string[]>([]);
  readonly currentScene = signal('');
  readonly lastError = signal('');
  readonly autoSwitch = signal(localStorage.getItem(STORAGE_KEYS.obsAutoSwitch) === 'true');
  /** MatchPosition → OBS scene name. */
  readonly sceneMap = signal<Partial<Record<MatchPosition, string>>>(this.loadMap());

  constructor() {
    this.obs.on('ConnectionClosed', () => this.onClosed());
    this.obs.on('CurrentProgramSceneChanged', ({ sceneName }) => this.currentScene.set(sceneName));

    // Follow the match: when the position changes, switch to its mapped scene.
    effect(() => {
      const position = this.session.match()?.position;
      if (!this.connected() || !this.autoSwitch() || !position) return;
      const scene = this.sceneMap()[position];
      if (scene && scene !== this.currentScene()) void this.setScene(scene);
    });
  }

  async connect(url: string, password: string): Promise<void> {
    this.lastError.set('');
    try {
      await this.obs.connect(url, password || undefined);
      this.connected.set(true);
      localStorage.setItem(STORAGE_KEYS.obsUrl, url);
      await this.refreshScenes();
    } catch (err) {
      this.connected.set(false);
      this.lastError.set(err instanceof Error ? err.message : String(err));
    }
  }

  async disconnect(): Promise<void> {
    await this.obs.disconnect();
    this.onClosed();
  }

  async refreshScenes(): Promise<void> {
    const { scenes, currentProgramSceneName } = await this.obs.call('GetSceneList');
    this.scenes.set(scenes.map((s) => String(s['sceneName'])));
    this.currentScene.set(currentProgramSceneName ?? '');
  }

  async setScene(sceneName: string): Promise<void> {
    if (!this.connected()) return;
    await this.obs.call('SetCurrentProgramScene', { sceneName });
    this.currentScene.set(sceneName);
  }

  setAutoSwitch(enabled: boolean): void {
    this.autoSwitch.set(enabled);
    localStorage.setItem(STORAGE_KEYS.obsAutoSwitch, String(enabled));
  }

  mapScene(position: MatchPosition, sceneName: string): void {
    this.sceneMap.update((map) => ({ ...map, [position]: sceneName }));
    localStorage.setItem(STORAGE_KEYS.obsSceneMap, JSON.stringify(this.sceneMap()));
  }

  savedUrl(): string {
    return localStorage.getItem(STORAGE_KEYS.obsUrl) ?? DEFAULT_OBS_URL;
  }

  private onClosed(): void {
    this.connected.set(false);
    this.scenes.set([]);
    this.currentScene.set('');
  }

  private loadMap(): Partial<Record<MatchPosition, string>> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.obsSceneMap) ?? '{}');
    } catch {
      return {};
    }
  }
}
