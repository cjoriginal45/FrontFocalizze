import { Component, OnDestroy, OnInit } from '@angular/core';
import { Header } from "../../../components/header/header";
import { Menu } from "../../../components/menu/menu";
import { Suggestions } from "../../../components/suggestions/suggestions";
import { NotificationInterface } from '../../../interfaces/NotificationInterface';
import { Subscription } from 'rxjs';
import { WebSockets } from '../../../services/webSockets/web-sockets';

@Component({
  selector: 'app-notifications',
  imports: [Header, Menu, Suggestions],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {
  notifications: NotificationInterface[] = [];
  private notificationSubscription!: Subscription;

  constructor(private webSocketService: WebSockets) {}

  ngOnDestroy(): void {
    this.webSocketService.connect();

    this.notificationSubscription = this.webSocketService.notification$
  .subscribe(notification => {
    // Añadimos la nueva notificación al principio de la lista
    this.notifications.unshift(notification);
  });
  }

  
  ngOnInit(): void {
    this.notificationSubscription.unsubscribe();
    // this.webSocketService.disconnect(); 
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
    
}
