import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BlockedUser } from '../../interfaces/BlockedUser';

export interface BlockResponse {
  isBlocked: boolean;
} 

@Injectable({
  providedIn: 'root',
})
export class Block {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/users`;

  /**
   * Envía una solicitud para bloquear o desbloquear a un usuario.
   * @param username El nombre de usuario a bloquear/desbloquear.
   * @returns Un observable con el estado final del bloqueo.
   */
  toggleBlock(username: string): Observable<BlockResponse> {
    return this.http.post<BlockResponse>(`${this.apiUrl}/${username}/block`, {});
  }

  /**
   * Obtiene la lista de usuarios bloqueados.
   * @returns Un observable con la lista de usuarios bloqueados.
   */
  getBlockedUsers(): Observable<BlockedUser[]> {
    return this.http.get<BlockedUser[]>(`${environment.apiBaseUrl}/users/blocked`);
  }
}
