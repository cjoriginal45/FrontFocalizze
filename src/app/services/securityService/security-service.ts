import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl + '/users';
  private authUrl = environment.apiBaseUrl + '/auth';

  /**
   * Activa o desactiva la autenticación en dos pasos (2FA).
   */
  toggleTwoFactor(enable: boolean): Observable<any> {
    // El backend debería esperar un booleano o un objeto { enabled: boolean }
    return this.http.patch(`${this.apiUrl}/me/2fa`, { enabled: enable });
  }

  /**
   * Cierra la sesión en todos los dispositivos (invalida todos los tokens del usuario).
   */
  logoutAllDevices(): Observable<any> {
    return this.http.post(`${this.authUrl}/logout-all`, {});
  }
}
