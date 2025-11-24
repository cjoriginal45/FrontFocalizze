import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Header } from "../../../components/header/header";
import { Suggestions } from "../../../components/suggestions/suggestions";
import { NotificationInterface } from '../../../interfaces/NotificationInterface';
import { Subscription } from 'rxjs';
import { WebSockets } from '../../../services/webSockets/web-sockets';
import { MatIcon } from "@angular/material/icon";
import { Notification } from '../../../services/notification/notification';
import { TimeAgoPipe } from "../../../pipes/time-ago/time-ago-pipe";
import { RouterLink } from "@angular/router";
import { NotificationState } from '../../../services/notification-state/notification-state';

@Component({
  selector: 'app-notifications',
  imports: [Header, Suggestions, MatIcon, TimeAgoPipe, RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {
  
  private notificationSubscription!: Subscription;
  private webSocketService = inject(WebSockets);
  private notificationService = inject(Notification);
  private notificationStateService = inject(NotificationState);

  notifications: NotificationInterface[] = [];
  isLoading = false;
  currentPage = 0;
  isLastPage = false;

  constructor() {}

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
  }

  
  ngOnInit(): void {
    this.notificationStateService.markAllAsRead();

    // Conectamos al WebSocket para recibir notificaciones en tiempo real.
    this.webSocketService.connect();
    
    // Nos suscribimos a las nuevas notificaciones que lleguen.
    this.notificationSubscription = this.webSocketService.notification$
      .subscribe(newNotification => {
        // Añadimos la nueva notificación al PRINCIPIO de la lista.
        this.notifications.unshift(newNotification);
      });
      
    // Cargamos la primera página del historial de notificaciones.
    this.loadMoreNotifications();
  }

  getIconForNotification(type: string): string {
    switch(type) {
    case 'NEW_LIKE': return 'favorite';
    case 'NEW_COMMENT': return 'chat_bubble';
    case 'NEW_FOLLOWER': return 'person_add';
    case 'MENTION': return 'alternate_email';
    default: return 'notifications';
    }
  }

  /**
   * Carga la siguiente página del historial de notificaciones.
   */
  loadMoreNotifications(): void {
    if (this.isLoading || this.isLastPage) return;
    this.isLoading = true;

    this.notificationService.getNotifications(this.currentPage, 20).subscribe({
      next: (page) => {
        // Añadimos las notificaciones antiguas al FINAL de la lista.
        this.notifications.push(...page.content);
        this.isLastPage = page.last;
        this.currentPage++;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al cargar el historial de notificaciones", err);
        this.isLoading = false;
      }
    });
  }
    

  getLinkForNotification(notification: NotificationInterface): any[] | null {
    switch (notification.type) {
      case 'NEW_FOLLOWER':
        if (notification.triggerUser) {
          return ['/profile', notification.triggerUser.username];
        }
        return null;
  
      case 'NEW_LIKE':
      case 'NEW_COMMENT':
      case 'MENTION':
        // --- CORRECCIÓN: Solo devuelve el path base ---
        if (notification.threadId) {
          return ['/search'];
        }
        return null;
  
      default:
        return null;
    }
  }


  getQueryParamsForNotification(notification: NotificationInterface): object | null {
    switch (notification.type) {
      // Notificaciones relacionadas con un hilo usan el parámetro 'q'
      case 'NEW_LIKE':
      case 'NEW_COMMENT':
      case 'MENTION':
        if (notification.threadPreview) {
          return { q: notification.threadPreview };
        }
        return null;

      // Otros tipos de notificación no tienen queryParams
      case 'NEW_FOLLOWER':
      default:
        return null;
    }
  }
}
