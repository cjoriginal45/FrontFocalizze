import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Like {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/thread`;

  /**
   * Envía una petición para dar o quitar un "like" a un hilo.
   * @param threadId El ID del hilo al que se le dará/quitará el like.
   * @returns Un Observable que se completa cuando la operación finaliza.
   *
   * Sends a request to like or unlike a thread.
   * @param threadId The ID of the thread to like or unlike.
   * @returns An Observable that completes when the operation completes.
   */
  toggleLike(threadId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${threadId}/like`, {});
  }
}
