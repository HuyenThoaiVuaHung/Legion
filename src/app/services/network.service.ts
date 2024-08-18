import { Injectable, signal, Signal, WritableSignal } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { NetworkStatus } from "./types/network.enum";

@Injectable({
  providedIn: "root",
})
export class NetworkService {
  public socket: WritableSignal<Socket> = signal(
    io({
      autoConnect: false,
    })
  );
  public networkStatus: NetworkStatus = NetworkStatus.UNCONNECTED;
  public url: string | undefined;
  constructor() {
    if (localStorage.getItem("defaultUrl")) {
      this.connect(localStorage.getItem("defaultUrl")!);
    }
  }
  public connect(url: string) {
    this.socket.set(io(url));
    this.socket().connect();
    this.url = url;
    this.networkStatus = NetworkStatus.CONNECTING;
    this.socket().on("connect", () => {
      this.networkStatus = NetworkStatus.CONNECTED;
      localStorage.setItem("defaultUrl", url);
    });
    this.socket().on("connect_error", (error: Error) => {
      this.socket().disconnect();
      this.networkStatus = NetworkStatus.CONNECTION_ERROR;
      localStorage.removeItem("defaultUrl");
    });
    this.socket().on("disconnect", () => {
      this.networkStatus = NetworkStatus.DISCONNECTED;
    });
  }
  public disconnect() {
    this.socket().disconnect();
    this.networkStatus = NetworkStatus.UNCONNECTED;
    localStorage.removeItem("defaultUrl");
  }
}
