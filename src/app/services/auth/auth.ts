import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

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
  private apiUrl = environment.apiBaseUrl;

  currentUser = signal<AuthUser | null>(null);

  // SIGNAL: This is the "source of truth" for the session state.
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();

    effect(() => {
      console.log('[AuthService] El estado de autenticación ha cambiado:', this.isLoggedIn());
    });
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken: UserTokenData = jwtDecode(token);
        // Aquí tenemos un problema: el token solo tiene el username ('sub').
        // No tenemos el 'id' ni el 'displayName' al recargar la página.
        // Por ahora, creamos un objeto de usuario parcial.
        this.currentUser.set({ 
          id: 0, // Placeholder
          username: decodedToken.sub,
          displayName: '' // Placeholder
        });
        
        // TODO: En el futuro, hacer una llamada a una API GET /api/users/me
        // para obtener los datos completos del usuario y rellenar la señal.
        
      } catch (error) {
        // Si el token es inválido, lo limpiamos.
        localStorage.removeItem('jwt_token');
      }
    }
  }


  private hasToken(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('jwt_token', response.token);
          
          // Decodificamos el token para obtener el 'username'.
          const decodedToken: UserTokenData = jwtDecode(response.token);

          // Creamos el objeto AuthUser con los datos del login y del token.
          const user: AuthUser = {
            id: response.userId,
            username: decodedToken.sub,
            displayName: response.displayName,
          };
          
          // Actualizamos la señal con el objeto del usuario completo.
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
