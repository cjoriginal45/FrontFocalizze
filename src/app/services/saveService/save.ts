import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Save {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/thread`;

  /**
   * Envía una petición para guardar o quitar el guardado de un hilo.
   * @param threadId El ID del hilo afectado.
   * @returns Un Observable que se completa cuando la operación finaliza.
   *
   * * Sends a request to save or unsave a thread.
   * @param threadId The ID of the affected thread.
   * @returns An Observable that completes when the operation completes.
   */
  toggleSave(threadId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${threadId}/save`, {});
  }
}
