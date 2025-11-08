import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserInterface } from '../../interfaces/UserInterface';

@Injectable({
  providedIn: 'root'
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
}
