import { effect, Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public readonly config: WritableSignal<ApplicationConfig> = signal(this.loadConfig());
  constructor() {

    effect(() => {
      localStorage.setItem("appConfig", JSON.stringify(this.config()));
    })
  }

  private loadConfig(): ApplicationConfig {
    const defaultConfig: ApplicationConfig = {
      automaticallyShowTangTocAnswer: true
    };
    try {
      return JSON.parse(localStorage.getItem("appConfig") ?? "") as ApplicationConfig || defaultConfig;
    } catch (error) {
      return defaultConfig;
    }
  }
}

export type ApplicationConfig = {
  automaticallyShowTangTocAnswer: boolean
}
