import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { WebSockets } from '../webSockets/web-sockets';
import { Subscription, tap } from 'rxjs';
import { Notification } from '../notification/notification';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Interfaz para la respuesta de verificación de notificaciones.
 */
interface UnreadResponse {
  hasUnread: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationState {
   // --- Inyección de dependencias ---
   private readonly notificationApiService = inject(Notification);
   private readonly webSocketService = inject(WebSockets);
   private readonly destroyRef = inject(DestroyRef);

    // --- Estado Reactivo ---
  /** Señal que indica si hay notificaciones pendientes. Consumida por la UI (puntos rojos, contadores). */
  public readonly hasUnreadNotifications: WritableSignal<boolean> = signal(false);

  /** Referencia a la suscripción de sockets para limpieza manual */
  private notificationSubscription?: Subscription;


  /**
   * Inicializa el servicio de estado. 
   * Debe llamarse tras un login exitoso.
   */
  public initialize(): void {
    // Protección contra suscripciones duplicadas
    if (this.notificationSubscription) {
      this.clear();
    }

    // 1. Conexión al túnel de WebSocket
    this.webSocketService.connect();

    // 2. Suscripción reactiva a eventos entrantes
    // Usamos takeUntilDestroyed para asegurar limpieza si el ServiceProvider se destruye
    this.notificationSubscription = this.webSocketService.notification$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.hasUnreadNotifications.set(true);
      });

    // 3. Sincronización inicial con la base de datos
    this.checkForUnreadNotifications();
  }

 /**
   * Consulta al servidor el estado actual de las notificaciones.
   */
 private checkForUnreadNotifications(): void {
  this.notificationApiService.checkUnread()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response: UnreadResponse) => this.hasUnreadNotifications.set(response.hasUnread),
      error: (err) => console.error('Error sincronizando notificaciones iniciales', err)
    });
}

  /**
   * Ejecuta el proceso de marcado de lectura global.
   * Implementa un patrón de actualización optimista para mejorar la UX.
   */
  public markAllAsRead(): void {
    if (!this.hasUnreadNotifications()) return;

    // Actualización optimista: asumimos éxito
    this.hasUnreadNotifications.set(false);

    this.notificationApiService.markAllAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => {
          console.error('Fallo al marcar notificaciones. Revirtiendo estado.', err);
          // Reversión del estado en caso de error de red/servidor
          this.hasUnreadNotifications.set(true);
        },
      });
  }

  /**
   * Limpia el estado, cancela suscripciones y cierra el socket.
   * Debe llamarse al cerrar sesión (Logout).
   */
  public clear(): void {
    this.notificationSubscription?.unsubscribe();
    this.notificationSubscription = undefined;
    this.webSocketService.disconnect();
    this.hasUnreadNotifications.set(false);
  }
}
