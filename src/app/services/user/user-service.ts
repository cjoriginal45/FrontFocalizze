import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserInterface } from '../../interfaces/UserInterface';
import { InteractionStatus } from '../../interfaces/InteractionStatus';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  /**
   * Obtiene los datos del perfil del usuario actualmente autenticado.
   */
  getMe(): Observable<UserInterface> {
    return this.http.get<UserInterface>(`${this.apiUrl}/me`);
  }

  getInteractionStatus(): Observable<InteractionStatus> {
    return this.http.get<InteractionStatus>(`${this.apiUrl}/me/interactions`);
  }
}
