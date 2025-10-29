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
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { FeedThreadDto } from '../../../interfaces/FeedThread';

@Component({
  selector: 'app-profile',
  imports: [CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    Thread],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
 // Inyección de servicios moderna
 private route = inject(ActivatedRoute);
 private profileService = inject(ProfileService);
 private authService = inject(Auth);

 // Propiedades del componente
 profile: ProfileInterface | null = null;
 threads: FeedThreadDto[] = []; 
 isLoading = true;
 isOwnProfile = false;

 // Paginación para scroll infinito
 private currentPage = 0;
 private readonly pageSize = 10;
 private allThreadsLoaded = false;

 ngOnInit(): void {
   // Escuchamos los cambios en el parámetro 'username' de la URL
   this.route.paramMap.pipe(
     tap(() => {
       // Reiniciamos el estado en cada cambio de perfil
       this.isLoading = true;
       this.profile = null;
       this.threads = [];
       this.currentPage = 0;
       this.allThreadsLoaded = false;
     }),
     switchMap(params => {
       const username = params.get('username');
       if (!username) {
         throw new Error('Username no encontrado en la URL');
       }

       // Verificamos si es nuestro propio perfil
       // this.isOwnProfile = this.authService.getCurrentUser()?.username === username;

       // Hacemos las dos llamadas a la API en paralelo
       return forkJoin({
        profile: this.profileService.getProfile(username),
        threads: this.profileService.getThreadsForUser(username, this.currentPage, this.pageSize)
      });
    }),
    // --- MAPEAMOS LA RESPUESTA ANTES DE SUSCRIBIRNOS ---
    map(({ profile, threads: threadResponses }) => {
      const mappedThreads: FeedThreadDto[] = threadResponses.map(dto => this.mapDtoToViewModel(dto));
      return { profile, threads: mappedThreads };
    })
   ).subscribe({
     next: ({ profile, threads }) => {
       this.profile = profile;
       this.threads = threads;
       this.isLoading = false;
       // Si la primera carga trae menos hilos que el tamaño de página, ya no hay más
       if (threads.length < this.pageSize) {
         this.allThreadsLoaded = true;
       }
     },
     error: (err) => {
       console.error('Error al cargar los datos del perfil', err);
       this.isLoading = false;
       // Aquí podrías redirigir a una página de "Usuario no encontrado"
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
       next: (newThreads) => {
         if (newThreads.length > 0) {
           this.threads = [...this.threads, ...newThreads.map(dto => this.mapDtoToViewModel(dto))]; 
         }
         if (newThreads.length < this.pageSize) {
           this.allThreadsLoaded = true; // No hay más hilos que cargar
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
   console.log('Abrir modal para editar perfil...');
   // Aquí llamarías a un ModalService para abrir la modal de edición
 }
}
