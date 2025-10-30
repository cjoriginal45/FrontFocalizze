import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiBaseUrl;

  // SIGNAL: This is the "source of truth" for the session state.
  isLoggedIn = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      // Aquí guardamos el token en el localStorage si el login es exitoso.
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
        }
      })
    );
  }

  // Elimina el token del localStorage al cerrar sesión.
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.isLoggedIn.set(false); // Actualiza la señal a 'false'
    this.router.navigate(['/login']); // Redirige al login
  }

  getCurrentUser(): { username: string } | null {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;
    const decodedToken: { sub: string } = jwtDecode(token);
    return { username: decodedToken.sub };
  }
}
