import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../../interfaces/LoginResponse';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }


  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      // Aquí guardamos el token en el localStorage si el login es exitoso.
      tap(response => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  // Elimina el token del localStorage al cerrar sesión.
  logout(): void {
    localStorage.removeItem('jwt_token');
  }
  
  // Verifica si el usuario está autenticado (si existe un token).
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }


}
