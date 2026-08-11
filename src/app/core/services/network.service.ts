import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { STORAGE_KEYS } from '../constants';

export enum ConnectionStatus {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Error = 'error',
}

/**
 * Owns the socket.io connection and the server base URL. Nothing outside
 * this file (and SessionService) may touch the raw Socket.
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {
  private socketRef: Socket | null = null;

  readonly status = signal(ConnectionStatus.Disconnected);
  readonly serverUrl = signal(localStorage.getItem(STORAGE_KEYS.serverUrl) ?? '');

  /** HTTP base for REST/media calls; '' means same-origin. */
  apiBase(): string {
    return this.serverUrl().replace(/\/$/, '');
  }

  /** (Re)connects, replacing any previous socket. Token rides the handshake. */
  connect(url: string, token?: string): Socket {
    this.socketRef?.removeAllListeners();
    this.socketRef?.disconnect();

    this.status.set(ConnectionStatus.Connecting);
    const socket = io(url || window.location.origin, {
      auth: token ? { token } : undefined,
    });
    this.socketRef = socket;

    socket.on('connect', () => {
      this.status.set(ConnectionStatus.Connected);
      this.serverUrl.set(url);
      localStorage.setItem(STORAGE_KEYS.serverUrl, url);
    });
    socket.on('connect_error', () => {
      this.status.set(ConnectionStatus.Error);
      socket.disconnect();
    });
    socket.on('disconnect', () => {
      if (this.status() !== ConnectionStatus.Error) {
        this.status.set(ConnectionStatus.Disconnected);
      }
    });
    return socket;
  }

  disconnect(): void {
    this.socketRef?.removeAllListeners();
    this.socketRef?.disconnect();
    this.socketRef = null;
    this.status.set(ConnectionStatus.Disconnected);
    localStorage.removeItem(STORAGE_KEYS.serverUrl);
  }

  /** Subscribe to a server event. Returns an unsubscribe function. */
  on<T extends unknown[]>(event: string, handler: (...args: T) => void): () => void {
    this.socketRef?.on(event, handler as (...args: unknown[]) => void);
    return () => this.socketRef?.off(event, handler as (...args: unknown[]) => void);
  }

  emit(event: string, ...args: unknown[]): void {
    this.socketRef?.emit(event, ...args);
  }

  get connected(): boolean {
    return this.status() === ConnectionStatus.Connected;
  }
}
