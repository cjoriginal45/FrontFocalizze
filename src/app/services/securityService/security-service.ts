import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/security';

  /**
   * Activa o desactiva la autenticación en dos pasos (2FA).
   * Backend espera: PATCH /api/security/2fa
   */
  toggleTwoFactor(enable: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/2fa`, { enabled: enable });
  }

  /**
   * Cierra la sesión en todos los dispositivos.
   * Backend espera: POST /api/security/logout-all
   */
  logoutAllDevices(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout-all`, {});
  }

  validateCurrentPassword(password: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/validate-password`, { password });
  }
}
