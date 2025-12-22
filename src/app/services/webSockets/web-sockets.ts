import { Injectable } from '@angular/core';
import { NotificationInterface } from '../../interfaces/NotificationInterface';
import { Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSockets {
  private stompClient: Client | null = null;
  // Subject para emitir las nuevas notificaciones recibidas
  private notificationSubject = new Subject<NotificationInterface>();
  public notification$ = this.notificationSubject.asObservable();
  constructor() {}

  connect(): void {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.log('No hay token, no se puede conectar al WebSocket.');
      return;
    }

    const serverUrl = environment.production
      ? window.location.origin.replace('http', 'ws')
      : 'http://localhost:8080/';

    if (this.stompClient && this.stompClient.active) {
      console.log('Cliente STOMP ya está conectado.');
      return;
    }

    // Creamos el cliente STOMP
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('${serverUrl}/ws'),

      // Pasamos el token JWT en las cabeceras de conexión para la autenticación
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      debug: (str) => {
        console.log(new Date(), str);
      },
      reconnectDelay: 5000,
    });

    // Cuando la conexión es exitosa
    this.stompClient.onConnect = (frame) => {
      console.log('Conectado al servidor WebSocket:', frame);

      // Nos suscribimos al "topic" personal de notificaciones
      this.stompClient!.subscribe('/user/queue/notifications', (message: IMessage) => {
        const notification = JSON.parse(message.body) as NotificationInterface;
        console.log('Nueva notificación recibida:', notification);
        this.notificationSubject.next(notification);
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Error en STOMP:', frame.headers['message'], 'Detalles:', frame.body);
    };

    // Activamos la conexión
    this.stompClient.activate();
  }
  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('Desconectado del servidor WebSocket.');
    }
  }
}
