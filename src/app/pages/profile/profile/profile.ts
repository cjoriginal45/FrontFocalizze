import { CommonModule } from '@angular/common';
import { Component, effect, inject, Injector, Input, OnInit, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Thread } from '../../../components/thread/thread';
import { Auth } from '../../../services/auth/auth';
import { ThreadResponse } from '../../../interfaces/ThreadResponseDto';
import { ProfileService } from '../../../services/profile/profile';
import { ProfileInterface } from '../../../interfaces/ProfileInterface';
import { filter, forkJoin, map, switchMap, tap } from 'rxjs';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileModal } from '../../../components/edit-profile/edit-profile-modal/edit-profile-modal';
import { ThreadState } from '../../../services/thread-state/thread-state';
import { Header } from '../../../components/header/header';
import { Comments } from '../../../components/comments/comments';
import { FollowButton } from '../../../components/follow-button/follow-button/follow-button';
import { UserInterface } from '../../../interfaces/UserInterface';
import { UserState } from '../../../services/user-state/user-state';
import { CreateThreadButton } from '../../../components/create-thread-button/create-thread-button';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { MatMenuModule } from '@angular/material/menu';
import { Block } from '../../../services/block/block';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmMatDialog } from '../../../components/mat-dialog/mat-dialog/mat-dialog';
import { FollowersFollowingModal } from '../../../components/followers-following-modal/followers-following-modal';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    Thread,
    Header,
    FollowButton,
    CreateThreadButton,
    BottonNav,
    MatMenuModule,
    TranslateModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  // --- Inyección de Dependencias ---
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private authService = inject(Auth);
  private dialog = inject(MatDialog);
  private threadStateService = inject(ThreadState);
  private userStateService = inject(UserState);
  private blockService = inject(Block);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  private injector = inject(Injector);

  profile: ProfileInterface | null = null;
  threadIds: number[] = [];
  isLoading = true;
  isOwnProfile = false;

  private currentPage = 0;
  private readonly pageSize = 10;
  private allThreadsLoaded = false;

  // --- Inicialización del objeto de usuario ---
  @Input({ required: true }) userSignal!: WritableSignal<UserInterface>;

  ngOnInit(): void {
    // 1. Carga inicial del perfil (Igual que antes)
    this.route.paramMap
      .pipe(
        tap(() => {
          this.isLoading = true;
          this.profile = null;
          this.threadIds = [];
        }),
        switchMap((params) => {
          const username = params.get('username');
          if (!username) throw new Error('Username no encontrado');

          const currentUser = this.authService.getCurrentUser();
          this.isOwnProfile = currentUser?.username === username;

          if (this.isOwnProfile) {
            effect(
              () => {
                const currentUserSignal = this.authService.currentUser();
                if (currentUserSignal && this.profile) {
                  this.profile.follow = currentUserSignal.followingCount;
                }
              },
              { injector: this.injector }
            );
          }

          return forkJoin({
            profile: this.profileService.getProfile(username),
            threads: this.profileService.getThreadsForUser(
              username,
              this.currentPage,
              this.pageSize
            ),
            userForButton: this.profileService.getUserForFollowButton(username),
          });
        })
      )
      .subscribe({
        next: ({ profile, threads: threadPage }) => {
          this.profile = profile;
          const userForState: UserInterface = {
            id: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            isFollowing: profile.isFollowing,
            followersCount: profile.followers,
            followingCount: profile.followingCount,
          };
          this.userStateService.loadUsers([userForState]);
          const newThreads: FeedThreadDto[] = threadPage.content;
          this.threadStateService.loadThreads(newThreads);
          this.threadIds = newThreads.map((t) => t.id);
          this.isLoading = false;
          this.allThreadsLoaded = threadPage.last;
        },
        error: (err) => {
          console.error('Error cargando perfil:', err);
          this.isLoading = false;
        },
      });

    // --- NUEVO: ESCUCHAR CREACIÓN DE HILOS (Soluciona Problema 1 y 2) ---
    this.threadStateService.threadCreated$.subscribe((newThread) => {
      // Solo nos importa si estamos viendo NUESTRO propio perfil
      if (this.isOwnProfile && this.profile) {
        // A. Agregar el hilo a la lista visual (arriba de todo)
        this.threadIds.unshift(newThread.id);
        // Aseguramos que el hilo esté en el store (por si acaso)
        this.threadStateService.loadThreads([newThread]);

        // B. Actualizar contadores
        this.profile.threadCount++; // Subimos el total histórico

        // Bajamos el disponible diario (sin bajar de 0)
        if (this.profile.threadsAvailableToday !== null) {
          this.profile.threadsAvailableToday = Math.max(0, this.profile.threadsAvailableToday - 1);
        }
      }
    });

    // --- ESCUCHAR BORRADO DE HILOS (Soluciona Problema 3 y 1) ---
    this.threadStateService.threadDeleted$.subscribe((deletedThreadId) => {
      const threadSignal = this.threadStateService.getThreadSignal(deletedThreadId);
      const threadData = threadSignal ? threadSignal() : null;

      this.threadIds = this.threadIds.filter((id) => id !== deletedThreadId);

      if (this.profile) {
        this.profile.threadCount = Math.max(0, this.profile.threadCount - 1);

        if (this.isOwnProfile && threadData) {
          if (this.isThreadFromToday(threadData.publicationDate)) {
            const DAILY_LIMIT = 3;
            const currentAvailable = this.profile.threadsAvailableToday || 0;
            this.profile.threadsAvailableToday = Math.min(DAILY_LIMIT, currentAvailable + 1);
          }
        }
      }
    });
  }

  loadMoreThreads(): void {
    if (this.isLoading || this.allThreadsLoaded || !this.profile) return;
    this.isLoading = true;
    this.currentPage++;

    this.profileService
      .getThreadsForUser(this.profile.username, this.currentPage, this.pageSize)
      .subscribe({
        next: (threadPage) => {
          const newThreads: FeedThreadDto[] = threadPage.content;
          this.threadStateService.loadThreads(newThreads);
          const newThreadIds = newThreads.map((t) => t.id);
          this.threadIds.push(...newThreadIds);

          this.allThreadsLoaded = threadPage.last;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar más hilos del usuario', err);
          this.isLoading = false;
        },
      });
  }

  editProfile(): void {
    if (!this.profile) return;

    const dialogRef = this.dialog.open(EditProfileModal, {
      width: '500px',
      data: { profile: this.profile },
    });

    dialogRef
      .afterClosed()
      .pipe(filter((result) => !!result))
      .subscribe((result) => {
        const { formData, file } = result;

        if (file) {
          this.profileService.uploadAvatar(this.profile!.username, file).subscribe({
            next: (response) => {
              console.log('Avatar actualizado con éxito');
              this.profile!.avatarUrl = response.avatarUrl;
              this.updateProfileText(formData);
            },
            error: (err) => console.error('Error al subir el avatar', err),
          });
        } else {
          this.updateProfileText(formData);
        }
      });
  }

  private updateProfileText(data: { displayName: string; biography: string }): void {
    if (!this.profile) return;

    this.profileService.updateProfile(this.profile.username, data).subscribe({
      next: (updatedProfile) => {
        console.log('Perfil actualizado con éxito');
        this.profile = updatedProfile;
      },
      error: (err) => console.error('Error al actualizar el perfil', err),
    });
  }

  openCommentsModal(threadId: number): void {
    this.dialog.open(Comments, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { threadId: threadId },
      panelClass: 'comments-dialog-container',
    });
  }

  onFollowChange(isNowFollowing: boolean): void {
    if (this.profile) {
      if (isNowFollowing) {
        this.profile.followers++;
      } else {
        this.profile.followers--;
      }
      this.userStateService.updateFollowingState(this.profile.username, isNowFollowing);
    }
  }

  openReportModal(): void {
    console.log('Abrir modal de reporte');
  }

  blockUser(): void {
    if (!this.profile) return;

    const isBlocking = !this.profile.isBlocked;
    const username = this.profile.username;

    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: isBlocking ? `¿Bloquear a @${username}?` : `¿Desbloquear a @${username}?`,
        message: isBlocking
          ? `No podrán seguirte ni ver tus publicaciones, y tú tampoco podrás ver las suyas.`
          : `Podrás volver a ver el perfil y las publicaciones de @${username}, y viceversa.`,
        confirmButtonText: isBlocking ? 'Bloquear' : 'Desbloquear',
        confirmButtonColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.executeToggleBlock(username);
      }
    });
  }

  private executeToggleBlock(username: string): void {
    this.blockService.toggleBlock(username).subscribe({
      next: (response) => {
        if (response.isBlocked) {
          this.snackBar.open(`Has bloqueado a @${username}.`, 'Cerrar', { duration: 3000 });
          this.router.navigate(['/home']);
        } else {
          if (this.profile) {
            this.profile.isBlocked = false;
          }
          this.snackBar.open(`Has desbloqueado a @${username}.`, 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        console.error('Error en la acción de bloqueo', err);
        this.snackBar.open('No se pudo completar la acción.', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openFollowModal(initialTab: 'followers' | 'following'): void {
    if (!this.profile) return;

    const dialogRef = this.dialog.open(FollowersFollowingModal, {
      width: '450px',
      maxWidth: '95vw',
      panelClass: 'custom-modal-radius',
      data: {
        username: this.profile.username,
        initialTab: initialTab,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      // Opcional: recargar perfil si fuera necesario,
      // pero la reactividad del userState debería cubrir la mayoría de casos.
    });
  }

  /**
   * Helper para verificar si una fecha corresponde al día de hoy local.
   * Maneja String, Date object o Array de Java [yyyy, mm, dd...]
   */
  private isThreadFromToday(dateInput: string | Date | number[]): boolean {
    const today = new Date();
    let threadDate: Date;

    if (Array.isArray(dateInput)) {
      // Array Java: [2023, 11, 28, 14, 30] -> Mes 1-based (Nov=11)
      // JS Date: Mes 0-based (Nov=10). Restamos 1 al mes.
      threadDate = new Date(
        dateInput[0],
        dateInput[1] - 1,
        dateInput[2],
        dateInput[3] || 0,
        dateInput[4] || 0
      );
    } else {
      threadDate = new Date(dateInput);
    }

    return (
      threadDate.getDate() === today.getDate() &&
      threadDate.getMonth() === today.getMonth() &&
      threadDate.getFullYear() === today.getFullYear()
    );
  }
}
