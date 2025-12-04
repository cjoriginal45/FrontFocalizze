import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
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
import { Language } from '../language/language';

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string; // Opcional, lo cargaremos después
  followingCount: number;
  followersCount: number;
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

  verifyOtp(data: VerifyOtpRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/verify-2fa`, data).pipe(
      tap((response) => {
        if (response.token) {
          this.handleSuccessfulLogin(response);
        }
      })
    );
  }

  // 3. Helper privado para reutilizar lógica de guardado
  private handleSuccessfulLogin(response: LoginResponse) {
    localStorage.setItem('jwt_token', response.token);

    // Aquí puedes decodificar y setear el currentUser básico
    const decodedToken: any = jwtDecode(response.token);
    const user: AuthUser = {
      id: response.userId,
      username: decodedToken.sub,
      displayName: response.displayName,
      avatarUrl: response.avatarUrl,
      followingCount: response.followingCount,
      followersCount: response.followersCount,
      dailyInteractionsRemaining: 0,
      isTwoFactorEnabled: response.isTwoFactorEnabled,
    };
    this.currentUser.set(user);
    this.notificationStateService.initialize();

    // Cargar el resto de datos en segundo plano
    this.loadUserCompleteData();
  }

  private loadUserCompleteData() {
    // Aquí pones tu forkJoin(getMe, interactions) que tenías antes
    // para actualizar el currentUser con los datos frescos.
    forkJoin({
      user: this.userService.getMe(),
      interactions: this.userService.getInteractionStatus(),
    }).subscribe(({ user, interactions }) => {
      const updatedUser = {
        ...user,
        dailyInteractionsRemaining: interactions.remaining,
      } as unknown as AuthUser;
      this.currentUser.set(updatedUser);
    });
  }

  // --- CARGA INICIAL DESDE EL TOKEN ---
  async loadUserFromToken(): Promise<void> {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decodedToken: { exp: number } = jwtDecode(token);
        if (Date.now() >= decodedToken.exp * 1000) {
          localStorage.removeItem('jwt_token');
        } else {
          // Inicializamos notificaciones
          this.notificationStateService.initialize();

          // Pedimos User + Interacciones
          const combinedData$ = forkJoin({
            user: this.userService.getMe(),
            interactions: this.userService.getInteractionStatus(),
          }).pipe(
            map(({ user, interactions }) => {
              // Mezclamos los objetos.
              // Como 'user' viene del backend (UserDto), si allá agregaste 'isTwoFactorEnabled',
              // aquí se propagará automáticamente gracias al spread operator (...user).
              return {
                ...user,
                dailyInteractionsRemaining: interactions.remaining,
              } as unknown as AuthUser;
            })
          );

          const authUser = await firstValueFrom(combinedData$);
          this.currentUser.set(authUser);
        }
      } catch (error) {
        console.error('Fallo al inicializar auth:', error);
        localStorage.removeItem('jwt_token');
      }
    }
    this.authReady.set(true);
  }

  // --- LOGIN ---
  login(credentials: { identifier: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        // Solo iniciamos sesión si YA nos dieron el token (caso sin 2FA)
        if (response.token) {
          this.handleSuccessfulLogin(response);
        }
      })
      // Quitamos el switchMap/map complejo de aquí para simplificar.
      // La carga de datos user/interacciones la haremos después de tener el token seguro.
    );
  }

  // Elimina el token del localStorage al cerrar sesión.
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.currentUser.set(null); // Esto hará que isLoggedIn() se vuelva false automáticamente.
    this.viewTrackingService.clearViewedThreads();
    // 3. Limpiamos los stores de datos.
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
      if (!user) return null; // Si no hay usuario, no hacemos nada

      // Creamos un nuevo objeto de usuario con los contadores actualizados
      return {
        ...user,
        followingCount: counts.followingCount ?? user.followingCount,
        followersCount: counts.followersCount ?? user.followersCount,
      };
    });
  }

  private clearAllAppState(): void {
    console.log('[AuthService] No hay usuario. Limpiando todos los estados de la aplicación...');
    this.threadStateService.clearState();
    this.userStateService.clearState();
    this.categoryState.clearState();
  }

  refundInteraction(): void {
    console.log('[AuthService] Delegando reembolso a InteractionCounter...');
    this.interactionCounter.incrementCount();
  }
}
