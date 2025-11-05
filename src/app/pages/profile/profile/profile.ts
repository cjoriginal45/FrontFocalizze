import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { Header } from "../../../components/header/header";
import { Comments } from '../../../components/comments/comments';
import { FollowButton } from "../../../components/follow-button/follow-button/follow-button";
import { UserInterface } from '../../../interfaces/UserInterface';

@Component({
  selector: 'app-profile',
  imports: [CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    Thread, Header, FollowButton],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  // --- Inyección de Dependencias ---
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
  private authService = inject(Auth);
  private dialog = inject(MatDialog);
  private threadStateService = inject(ThreadState);

  // --- Propiedades de Estado ---
  profile: ProfileInterface | null = null;
  threadIds: number[] = [];
  isLoading = true;
  isOwnProfile = false;

  private currentPage = 0;
  private readonly pageSize = 10;
  private allThreadsLoaded = false;
  // --- Inicialización del objeto de usuario ---
  userObject: UserInterface | null = null;


  ngOnInit(): void {
    this.route.paramMap.pipe(
      tap(() => { /* ... reinicio de estado ... */ }),
      switchMap(params => {
        const username = params.get('username');
        if (!username) throw new Error('Username no encontrado');

        this.isOwnProfile = this.authService.getCurrentUser()?.username === username;

        // forkJoin ahora espera que getThreadsForUser devuelva Page<FeedThreadDto>
        return forkJoin({
          profile: this.profileService.getProfile(username),
          threads: this.profileService.getThreadsForUser(username, this.currentPage, this.pageSize)
        });
      })
    ).subscribe({
      next: ({ profile, threads: threadPage }) => { // 'threadPage' ahora es de tipo Page<FeedThreadDto>
        this.profile = profile;

        this.buildUserForFollowButton(profile);
        // --- LÓGICA RESTAURADA ---
        const newThreads: FeedThreadDto[] = threadPage.content; // <-- Ahora .content existe
        this.threadStateService.loadThreads(newThreads);
        this.threadIds = newThreads.map(t => t.id);
        // ------------------------

        this.isLoading = false;
        this.allThreadsLoaded = threadPage.last; // <-- Usamos la propiedad 'last' de la página
      },
      // ...
    });
  }

  loadMoreThreads(): void {
    if (this.isLoading || this.allThreadsLoaded || !this.profile) return;
    this.isLoading = true;
    this.currentPage++;
    
    this.profileService.getThreadsForUser(this.profile.username, this.currentPage, this.pageSize)
      .subscribe({
        next: (threadPage) => {
          
          const newThreads: FeedThreadDto[] = threadPage.content;
          this.threadStateService.loadThreads(newThreads);
          const newThreadIds = newThreads.map(t => t.id);
          this.threadIds.push(...newThreadIds);
          // ------------------------
          
          this.allThreadsLoaded = threadPage.last;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar más hilos del usuario', err);
          this.isLoading = false;
         }
      });
  }

  editProfile(): void {
    if (!this.profile) return;

    const dialogRef = this.dialog.open(EditProfileModal, {
      width: '500px',
      data: { profile: this.profile }
    });

    dialogRef.afterClosed().pipe(
      filter(result => !!result)
    ).subscribe(result => {
      const { formData, file } = result;

      // 1. Si se seleccionó un nuevo archivo de avatar, lo subimos primero
      // 1. if a new avatar file is selected, upload it first
      if (file) {
        this.profileService.uploadAvatar(this.profile!.username, file).subscribe({
          next: (response) => {
            console.log('Avatar actualizado con éxito');
            this.profile!.avatarUrl = response.avatarUrl; 
            this.updateProfileText(formData);
          },
          error: (err) => console.error('Error al subir el avatar', err)
        });
      } else {
        // 2. Si no hay archivo nuevo, solo actualizamos los datos de texto
        // 2. If no new file, just update the text data
        this.updateProfileText(formData);
      }
    });
  }

  private updateProfileText(data: { displayName: string, biography: string }): void {
    if (!this.profile) return;

    this.profileService.updateProfile(this.profile.username, data).subscribe({
      next: (updatedProfile) => {
        console.log('Perfil actualizado con éxito');
        this.profile = updatedProfile;
      },
      error: (err) => console.error('Error al actualizar el perfil', err)
    });
  }


  openCommentsModal(threadId: number): void {
    this.dialog.open(Comments, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { threadId: threadId }, // Pasamos el ID del hilo
      panelClass: 'comments-dialog-container',
    });
  }

  private buildUserForFollowButton(profile: ProfileInterface): void {
    // Para construir el objeto UserInterface, necesitamos saber si el usuario actual
    // está siguiendo al usuario del perfil. Por ahora, como la API de perfil no
    // nos da esta información, lo pondremos en 'false' por defecto.
    // En el futuro, la API GET /api/profiles/{username} debería devolver este booleano.
    
    this.userObject = {
      // La API de perfil no devuelve el ID, lo cual es un problema.
      // Por ahora, usamos un valor temporal o lo dejamos en 0.
      // LO IDEAL es que la API GET /api/profiles/{username} devuelva también el ID.
      id: 0, // Placeholder
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      isFollowing: false // Placeholder, la API debería proveer esto
    };
  }

  onFollowChange(isNowFollowing: boolean): void {
    if (this.profile) {
      if (isNowFollowing) {
        // Si la acción fue 'seguir', incrementamos el contador de seguidores.
        this.profile.followers++;
      } else {
        // Si la acción fue 'dejar de seguir', lo decrementamos.
        this.profile.followers--;
      }
    }
  }



}




