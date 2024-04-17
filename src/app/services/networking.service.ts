import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { NetworkStatus } from './networking.enum';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class NetworkingService {
  private socket: Socket = {} as Socket;
  public networkStatus: NetworkStatus = NetworkStatus.DISCONNECTED;
  constructor() { }
  public async connect(url: string) {
    this.socket = io(url);
    this.networkStatus = NetworkStatus.CONNECTING;
    await new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        this.networkStatus = NetworkStatus.CONNECTED;
        localStorage.setItem('defaultUrl', url);
        resolve(null);
      });
      this.socket.on('connect_error', (error: Error) => {
        this.networkStatus = NetworkStatus.CONNECTION_ERROR;
        this.socket.disconnect();
        reject(error);
      });
      this.socket.on('disconnect', () => {
        this.networkStatus = NetworkStatus.DISCONNECTED;
      });
    });
  }
}
