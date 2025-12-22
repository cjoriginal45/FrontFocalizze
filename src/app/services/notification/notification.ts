import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Page } from '../../interfaces/PageInterface';
import { NotificationInterface } from '../../interfaces/NotificationInterface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Notification {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + '/notifications';

  /**
   * Obtiene una página del historial de notificaciones desde el backend.
   */
  getNotifications(page: number, size: number): Observable<Page<NotificationInterface>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http.get<Page<NotificationInterface>>(this.apiUrl, { params });
  }

  /**
   * Comprueba si el usuario tiene notificaciones sin leer.
   */
  checkUnread(): Observable<{ hasUnread: boolean }> {
    return this.http.get<{ hasUnread: boolean }>(`${this.apiUrl}/unread`);
  }

  /**
   * Marca todas las notificaciones del usuario como leídas.
   */
  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-as-read`, {});
  }
}
