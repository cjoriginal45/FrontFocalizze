import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom, forkJoin, map, Observable, tap, catchError, of } from 'rxjs';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../user/user-service';
import { ViewTracking } from '../viewTracking/view-tracking';
import { ThreadState } from '../thread-state/thread-state';
import { UserState } from '../user-state/user-state';
import { CategoryState } from '../category-state/category-state';
import { NotificationState } from '../notification-state/notification-state';
import { InteractionCounter } from '../interactionCounter/interaction-counter';
import { Theme } from '../themeService/theme';

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  followingCount: number;
  followersCount: number;
  role: string;
  dailyInteractionsRemaining: number;
  isTwoFactorEnabled?: boolean;
}

export interface VerifyOtpRequest {
  username: string;
  code: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiBaseUrl + '/auth';

  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);
  private viewTrackingService = inject(ViewTracking);

  private threadStateService = inject(ThreadState);
  private userStateService = inject(UserState);
  private categoryState = inject(CategoryState);
  private notificationStateService = inject(NotificationState);

  private interactionCounter = inject(InteractionCounter);
  private themeService = inject(Theme);

  // Signals
  currentUser = signal<AuthUser | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());
  authReady = signal<boolean>(false);

  constructor() {
    effect(() => {
      if (this.currentUser() === null) {
        this.clearAllAppState();
      }
    });
  }

  // --- MÉTODOS PÚBLICOS ---

  verifyOtp(data: VerifyOtpRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/verify-2fa`, data).pipe(
      tap((response) => {
        if (response.token) {
          this.handleSuccessfulLogin(response);
        }
      })
    );
  }

  /**
   * CORREGIDO: Carga el usuario optimista desde el token para evitar bloqueos
   * por "Cold Starts" en Render.
   */
  async loadUserFromToken(): Promise<void> {
    console.log('--- INICIO loadUserFromToken ---'); // 1. ¿Entra aquí?
    const token = localStorage.getItem('jwt_token');

    if (!token) {
      console.warn('No hay token en localStorage.');
      this.authReady.set(true);
      return;
    }

    console.log('Token encontrado:', token.substring(0, 10) + '...'); // 2. ¿Hay token?

    try {
      const decodedToken: any = jwtDecode(token);
      console.log('Token decodificado:', decodedToken); // 3. ¿Qué tiene adentro?

      const currentTime = Date.now() / 1000;
      console.log('Tiempo actual:', currentTime, 'Expiración token:', decodedToken.exp);

      if (decodedToken.exp < currentTime) {
        console.error('El token ha expirado. Haciendo logout automatico.');
        this.logout();
        this.authReady.set(true);
        return;
      }

      // IMPORTANTE: Mira si 'sub' existe en el log del paso 3.
      // Si tu backend no usa 'sub', cambia esto por decodedToken.username o lo que sea.
      const usernameFromToken = decodedToken.sub || decodedToken.username || 'Usuario';
      
      console.log('Usuario extraído del token:', usernameFromToken);

      const optimisticUser: AuthUser = {
        id: decodedToken.id || 0, 
        username: usernameFromToken,
        displayName: decodedToken.displayName || usernameFromToken,
        role: decodedToken.role || 'USER',
        followingCount: 0,
        followersCount: 0,
        dailyInteractionsRemaining: 0,
        isTwoFactorEnabled: decodedToken.isTwoFactorEnabled || false
      };

      console.log('Seteando usuario optimista:', optimisticUser);
      this.currentUser.set(optimisticUser); // ¡AQUÍ SE DEBERÍA VER EL LOGIN!
      this.authReady.set(true);

      // Hidratación
      console.log('Iniciando hidratación en segundo plano...');
      this.hydrateUserData();

    } catch (error) {
      console.error('CRASH en loadUserFromToken:', error);
      this.logout();
      this.authReady.set(true);
    }
  }

  // Método auxiliar para traer datos frescos sin bloquear el inicio
  private hydrateUserData(): void {
    forkJoin({
      user: this.userService.getMe(),
      interactions: this.userService.getInteractionStatus(),
    }).pipe(
      // Si falla (ej. timeout o 500 por cold start), no deslogueamos, solo logueamos el error
      catchError(err => {
        console.warn('Backend dormido o error de red, usando datos cacheados/token', err);
        return of(null); 
      })
    ).subscribe((response) => {
      if (response) {
        const { user, interactions } = response;
        
        // Sincronizar tema
        if (user.backgroundType) {
          this.themeService.syncWithUserDto(user.backgroundType, user.backgroundValue || '');
        }

        // Actualizar el signal con la data real de la BD
        this.currentUser.update(current => {
            if (!current) return null; // Por si hizo logout mientras cargaba
            return {
                ...current, // Mantenemos lo que ya teníamos
                ...user,    // Sobreescribimos con lo nuevo de la BD
                dailyInteractionsRemaining: interactions.remaining
            } as unknown as AuthUser;
        });
      }
    });
  }

  // --- LOGIN ---
  login(credentials: { identifier: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          this.handleSuccessfulLogin(response);
        }
      })
    );
  }

  isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'ADMIN';
  });

  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUser.set(null);
    this.viewTrackingService.clearViewedThreads();
    this.threadStateService.clearState();
    this.userStateService.clearState();
    this.categoryState.clearState();
    this.notificationStateService.clear();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  updateCurrentUserCounts(counts: { followingCount?: number; followersCount?: number }): void {
    this.currentUser.update((user) => {
      if (!user) return null;
      return {
        ...user,
        followingCount: counts.followingCount ?? user.followingCount,
        followersCount: counts.followersCount ?? user.followersCount,
      };
    });
  }

  private clearAllAppState(): void {
    this.threadStateService.clearState();
    this.userStateService.clearState();
    this.categoryState.clearState();
  }

  refundInteraction(): void {
    this.interactionCounter.incrementCount();
  }

  // --- HELPERS PRIVADOS ---

  private handleSuccessfulLogin(response: LoginResponse) {
    localStorage.setItem('jwt_token', response.token);

    const decodedToken: any = jwtDecode(response.token);
    
    // Construcción inicial del usuario
    const user: AuthUser = {
      id: response.userId,
      username: decodedToken.sub,
      displayName: response.displayName,
      avatarUrl: response.avatarUrl,
      followingCount: response.followingCount,
      followersCount: response.followersCount,
      role: response.role,
      dailyInteractionsRemaining: 0,
      isTwoFactorEnabled: decodedToken.isTwoFactorEnabled,
    };
    
    this.currentUser.set(user);
    this.notificationStateService.initialize();

    // Cargar datos completos (interacciones, tema, etc)
    this.loadUserCompleteData();
  }

  private loadUserCompleteData() {
    forkJoin({
      user: this.userService.getMe(),
      interactions: this.userService.getInteractionStatus(),
    }).pipe(
      catchError(() => of(null)) // Protección extra
    ).subscribe((response) => {
      if (!response) return;
      
      const { user, interactions } = response;
      const currentValue = this.currentUser()?.isTwoFactorEnabled;

      if (user.backgroundType) {
        this.themeService.syncWithUserDto(user.backgroundType, user.backgroundValue || '');
      }

      const updatedUser = {
        ...user,
        dailyInteractionsRemaining: interactions.remaining,
        isTwoFactorEnabled: user.isTwoFactorEnabled ?? currentValue,
      } as unknown as AuthUser;

      this.currentUser.set(updatedUser);
    });
  }
}
