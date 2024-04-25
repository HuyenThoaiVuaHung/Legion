import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { NetworkStatus } from './networking.enum';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class NetworkingService {
  public socket: Socket = {} as Socket;
  public networkStatus: NetworkStatus = NetworkStatus.UNCONNECTED;
  public url: string | undefined;
  constructor() { }
  public connect(url: string) {
    this.socket = io(url);
    this.url = url;
    this.networkStatus = NetworkStatus.CONNECTING;
    this.socket.on('connect', () => {
      this.networkStatus = NetworkStatus.CONNECTED;
      localStorage.setItem('defaultUrl', url);
    });
    this.socket.on('connect_error', (error: Error) => {
      this.socket.disconnect();
      this.networkStatus = NetworkStatus.CONNECTION_ERROR;
      localStorage.removeItem('defaultUrl');
    });
    this.socket.on('disconnect', () => {
      this.networkStatus = NetworkStatus.DISCONNECTED;
    });
  }
  public disconnect() {
    this.socket.disconnect();
    this.networkStatus = NetworkStatus.UNCONNECTED;
    localStorage.removeItem('defaultUrl');
  }
}
