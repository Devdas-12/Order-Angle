import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Helper } from 'src/app/shared/helper';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  socket_url = environment.SOCKET_URL;

  constructor(public helper: Helper) {
    // Connect to the Socket.IO server
    if (this.helper.jwt_token) {
      const socketOptions = {
        transportOptions: {
          polling: {
            extraHeaders: {
              // Add your custom headers here
              Authorization: `Bearer ${this.helper.jwt_token}`,
              // You can add more headers if needed
            },
          },
        },
      };
      this.socket = io(this.socket_url , socketOptions);
    }
  }

  // Listen for a specific event
  listener(event: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.socket.on(event, (data) => observer.next(data));
    });
  }

  // Emit a specific event
  emitEvent(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Disconnect the socket when not needed
  disconnect(): void {
    this.socket.disconnect();
  }
}
