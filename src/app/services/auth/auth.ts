import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable, tap } from 'rxjs';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../user/user-service';

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string; // Opcional, lo cargaremos después
}

interface UserTokenData {
  sub: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiBaseUrl + '/auth';


  private http = inject(HttpClient);
  private router = inject(Router);
  currentUser = signal<AuthUser | null>(null);
  private userService = inject(UserService); 

  // SIGNAL: This is the "source of truth" for the session state.
  isLoggedIn = computed(() => !!this.currentUser());

  authReady = signal<boolean>(false);

  constructor() {
    effect(() => {
      console.log('[AuthService] El estado de autenticación ha cambiado:', this.isLoggedIn());
    });
  }

  async loadUserFromToken(): Promise<void> {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        if (Date.now() >= decodedToken.exp * 1000) {
          localStorage.removeItem('jwt_token');
          // No hacemos nada más, currentUser ya es null.
        } else {
          // Usamos 'await' para esperar la respuesta de la API
          const user = await firstValueFrom(this.userService.getMe());
          this.currentUser.set(user);
        }
      } catch (error) {
        console.error('Fallo al inicializar el estado de autenticación:', error);
        localStorage.removeItem('jwt_token');
      }
    }
    // Marcamos que la autenticación está lista.
    this.authReady.set(true);
  }



  private hasToken(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
          const decodedToken: UserTokenData = jwtDecode(response.token);

          // Al hacer login, construimos el objeto AuthUser con los datos del login.
          const user: AuthUser = {
            id: response.userId,
            username: decodedToken.sub,
            displayName: response.displayName,
            avatarUrl: '' // La API de login no devuelve el avatar, lo cargaremos al recargar.
          };
          this.currentUser.set(user);
        }
      })
    );
  }

  // Elimina el token del localStorage al cerrar sesión.
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUser.set(null); // Esto hará que isLoggedIn() se vuelva false automáticamente.
    this.router.navigate(['/login']);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }
}
