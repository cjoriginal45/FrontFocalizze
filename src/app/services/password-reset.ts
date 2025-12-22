import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PasswordReset {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, { email });
  }

  validateResetToken(token: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/validate-reset-token`, { params: { token } });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
}
