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

@Component({
  selector: 'app-profile',
  imports: [CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    Thread, Header],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
 // Inyección de servicios moderna
 private route = inject(ActivatedRoute);
 private profileService = inject(ProfileService);
 private authService = inject(Auth);
 private dialog = inject(MatDialog);
 private threadStateService = inject(ThreadState);

 // Propiedades del componente
 profile: ProfileInterface | null = null;
 threadIds: number[] = []; 
 isLoading = true;
 isOwnProfile = false;

 // Paginación para scroll infinito
 private currentPage = 0;
 private readonly pageSize = 10;
 private allThreadsLoaded = false;

 ngOnInit(): void {
  this.route.paramMap.pipe(
    tap(() => {
      this.isLoading = true;
      this.profile = null;
      this.threadIds = []; // Reiniciamos los IDs
      this.currentPage = 0;
      this.allThreadsLoaded = false;
    }),
    switchMap(params => {
      const username = params.get('username');
      if (!username) throw new Error('Username no encontrado');

      this.isOwnProfile = this.authService.getCurrentUser()?.username === username;

      return forkJoin({
        profile: this.profileService.getProfile(username),
        threads: this.profileService.getThreadsForUser(username, this.currentPage, this.pageSize)
      });
    })
  ).subscribe({
    next: ({ profile, threads: threadResponses }) => {
      this.profile = profile;

      // --- LÓGICA DE CARGA EN EL STORE ---
      const mappedThreads: FeedThreadDto[] = threadResponses.map(dto => this.mapDtoToViewModel(dto));
      this.threadStateService.loadThreads(mappedThreads);
      this.threadIds = mappedThreads.map(t => t.id);
      // ---------------------------------

      this.isLoading = false;
      if (threadResponses.length < this.pageSize) {
        this.allThreadsLoaded = true;
      }
    },
    error: (err) => {
      console.error('Error al cargar los datos del perfil', err);
      this.isLoading = false;
    }
  });
}

 private mapDtoToViewModel(dto: ThreadResponse): FeedThreadDto {
  // Asumo que 'ThreadResponse' tiene la estructura que discutimos
  return {
    id: dto.id,
    user: {
      id: dto.author.id,
      username: dto.author.username,
      displayName: dto.author.displayName,
      avatarUrl: dto.author.avatarUrl || 'assets/images/default-avatar.png' 
    },
    publicationDate: dto.createdAt, // Llega como string, se queda como string
    posts: dto.posts,
    stats: dto.stats || { likes: 0, comments: 0, views: 0 },
    // Estos son estados de la UI, se inicializan por defecto
    isLiked: false, 
    isSaved: false
  };
}


 // Lógica para el scroll infinito (se llamaría desde una directiva o evento de scroll)
loadMoreThreads(): void {
    if (this.isLoading || this.allThreadsLoaded || !this.profile) return;
    this.isLoading = true;
    this.currentPage++;
    
    this.profileService.getThreadsForUser(this.profile.username, this.currentPage, this.pageSize)
      .subscribe({
        next: (newThreadResponses) => {
          // --- LÓGICA DE CARGA EN EL STORE ---
          const mappedNewThreads: FeedThreadDto[] = newThreadResponses.map(dto => this.mapDtoToViewModel(dto));
          this.threadStateService.loadThreads(mappedNewThreads);
          const newThreadIds = mappedNewThreads.map(t => t.id);
          this.threadIds.push(...newThreadIds);
          // ---------------------------------

          if (newThreadResponses.length < this.pageSize) {
            this.allThreadsLoaded = true;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar más hilos', err);
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
}



