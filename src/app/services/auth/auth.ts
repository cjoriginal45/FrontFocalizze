import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { firstValueFrom, forkJoin, map, Observable, switchMap, tap } from 'rxjs';
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
  avatarUrl?: string; // Opcional, lo cargaremos después
  followingCount: number;
  followersCount: number;
  role: string;
  dailyInteractionsRemaining: number; // Ahora este dato vendrá del endpoint separado
  isTwoFactorEnabled?: boolean;
}

interface UserTokenData {
  sub: string;
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
   * Carga el usuario desde el token guardado en el almacenamiento local.
   * Se ejecuta al inicializar la aplicación.
   */
async loadUserFromToken(): Promise<void> {
    const token = localStorage.getItem('jwt_token');

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.warn('Token expirado, cerrando sesión...');
          this.logout();
          this.authReady.set(true);
          return;
        }

        
        const optimisticUser: AuthUser = {
          id: decodedToken.id || 0, 
          username: decodedToken.sub || 'Usuario',
          displayName: decodedToken.displayName || decodedToken.sub || 'Usuario',
          avatarUrl: decodedToken.avatarUrl || undefined, 
          followingCount: 0, 
          followersCount: 0, 
          role: decodedToken.role || 'USER',
          dailyInteractionsRemaining: 0,
          isTwoFactorEnabled: decodedToken.isTwoFactorEnabled
        };

        this.currentUser.set(optimisticUser);
        this.notificationStateService.initialize();
        
        // Marcamos auth como lista para que los Guards dejen pasar
        this.authReady.set(true);

        this.hydrateUserData();

      } catch (error) {
        console.error('Error al decodificar token inicial:', error);
        this.logout();
        this.authReady.set(true);
      }
    } else {
      this.authReady.set(true);
    }
  }

  // Método auxiliar para traer datos frescos sin bloquear el inicio
  private hydrateUserData(): void {
    forkJoin({
      user: this.userService.getMe(),
      interactions: this.userService.getInteractionStatus(),
    }).pipe(
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
            if (!current) return null; 
            return {
                ...current, 
                ...user,    
                dailyInteractionsRemaining: interactions.remaining
            } as unknown as AuthUser;
        });
      }
    });
  
  
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
    console.log('[AuthService] No hay usuario. Limpiando todos los estados...');
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

    // Sincronizar tema con datos del login si vinieran en el DTO (opcional si loadUserCompleteData lo hace)
    this.loadUserCompleteData();
  }

  private loadUserCompleteData() {
    forkJoin({
      user: this.userService.getMe(),
      interactions: this.userService.getInteractionStatus(),
    }).subscribe(({ user, interactions }) => {
      const currentValue = this.currentUser()?.isTwoFactorEnabled;

      // SINCRONIZAMOS TEMA TAMBIÉN AQUÍ
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
