import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { WebSockets } from '../webSockets/web-sockets';
import { Subscription, tap } from 'rxjs';
import { Notification } from '../notification/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationState {
  private notificationApiService = inject(Notification);
  private webSocketService = inject(WebSockets);
  private notificationSubscription!: Subscription;

  // SEÑAL PÚBLICA: El header se suscribirá a esto para mostrar/ocultar el punto rojo.
  public hasUnreadNotifications: WritableSignal<boolean> = signal(false);

  constructor() {}

  /**
   * Inicializa el servicio. Se llama cuando el usuario se loguea.
   */
  initialize(): void {
    // 1. Conectamos al WebSocket
    this.webSocketService.connect();

    // 2. Nos suscribimos a nuevas notificaciones
    this.notificationSubscription = this.webSocketService.notification$.subscribe(
      (newNotification) => {
        this.hasUnreadNotifications.set(true);
      }
    );

    // 3. Comprobamos si hay notificaciones sin leer al inicio
    this.checkForUnreadNotifications();
  }

  /**
   * Comprueba en la API si hay notificaciones sin leer y actualiza la señal.
   */
  private checkForUnreadNotifications(): void {
    // Usamos el endpoint del backend que nos dice si hay no leídas.
    // (Este endpoint lo crearemos en el backend ahora).
    this.notificationApiService.checkUnread().subscribe((response) => {
      this.hasUnreadNotifications.set(response.hasUnread);
    });
  }

  /**
   * Se llama cuando el usuario visita la página de notificaciones.
   * Marca todas las notificaciones como leídas.
   */
  markAllAsRead(): void {
    // Solo hacemos la llamada a la API si la señal es true
    if (this.hasUnreadNotifications()) {
      this.notificationApiService
        .markAllAsRead()
        .pipe(
          tap(() => {
            // Actualización optimista: ponemos la señal a false inmediatamente.
            this.hasUnreadNotifications.set(false);
          })
        )
        .subscribe({
          error: (err) => {
            // Si falla, revertimos el estado
            console.error('Error al marcar notificaciones como leídas', err);
            this.hasUnreadNotifications.set(true);
          },
        });
    }
  }

  /**
   * Limpia el estado y desconecta el WebSocket. Se llama al hacer logout.
   */
  clear(): void {
    this.notificationSubscription?.unsubscribe();
    this.webSocketService.disconnect();
    this.hasUnreadNotifications.set(false);
  }
}
