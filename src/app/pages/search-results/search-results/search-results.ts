import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Thread } from '../../../components/thread/thread';
import { ActivatedRoute, Router } from '@angular/router';
import { Search } from '../../../services/search/search';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { map, of, switchMap } from 'rxjs';
import { ThreadResponse } from '../../../interfaces/ThreadResponseDto';
import { Header } from '../../../components/header/header';
import { FollowingDiscovering } from '../../../components/following-discovering/following-discovering';
import { ThreadState } from '../../../services/thread-state/thread-state';
import { UserState } from '../../../services/user-state/user-state';
import { MatDialog } from '@angular/material/dialog';
import { Comments } from '../../../components/comments/comments';
import { threadService } from '../../../services/thread/thread';

@Component({
  selector: 'app-search-results',
  imports: [CommonModule, MatIconModule, MatButtonModule, Thread, Header, FollowingDiscovering],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css',
})
export class SearchResults implements OnInit {
  // --- Inyección de Dependencias ---
  private route = inject(ActivatedRoute);
  private searchService = inject(Search);
  private threadStateService = inject(ThreadState);
  private router = inject(Router);
  private userStateService = inject(UserState);
  public dialog = inject(MatDialog);
  private location = inject(Location);
  private threadService = inject(threadService); 

  // --- Propiedades de Estado ---
  threadIds: number[] = [];
  query = '';
  isLoading = true;
  pageTitle = '';

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((params) => {
          this.isLoading = true;
          this.threadIds = [];
          
          const searchQuery = params.get('q');
          const threadIdStr = params.get('threadId');

          if (threadIdStr) {
            // Devuelve Observable<FeedThreadDto>
            const threadId = Number(threadIdStr);
            return this.threadService.getThreadById(threadId).pipe(
              map(thread => [thread]) // Lo convierte en Observable<FeedThreadDto[]>
            );
          } 
          else if (searchQuery) {
            // Devuelve Observable<ThreadResponse[]>
            return this.searchService.searchContent(searchQuery);
          }
          
          // Devuelve un Observable de array vacío
          return of([]);
        })
      )
      // --- ¡CORRECCIÓN CLAVE AQUÍ! ---
      // TypeScript sabe que 'results' puede ser FeedThreadDto[] O ThreadResponse[]
      .subscribe({
        next: (results: FeedThreadDto[] | ThreadResponse[]) => {
          let mappedThreads: FeedThreadDto[];

          // Hacemos una comprobación de tipo (Type Guard)
          if (results.length > 0 && 'author' in results[0]) {
            // Si el primer elemento tiene 'author', es un array de ThreadResponse[]
            // y necesita ser mapeado.
            mappedThreads = (results as ThreadResponse[]).map(dto => this.mapDtoToViewModel(dto));
          } else {
            // Si no, ya es un array de FeedThreadDto[] (o está vacío) y no necesita mapeo.
            mappedThreads = results as FeedThreadDto[];
          }
          
          // --- El resto de la lógica es la misma ---
          if (mappedThreads.length > 0) {
            const usersFromThreads = mappedThreads.map((t) => t.user);
            this.userStateService.loadUsers(usersFromThreads);
            this.threadStateService.loadThreads(mappedThreads);
            this.threadIds = mappedThreads.map((t) => t.id);
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error en la página de búsqueda', err);
          this.isLoading = false;
        }
      });

    this.threadStateService.threadDeleted$.subscribe((deletedThreadId) => {
      this.threadIds = this.threadIds.filter((id) => id !== deletedThreadId);
    });
  }

  goBack(): void {
    this.location.back(); // Usamos Location para una navegación más limpia
  }

  // --- CAMBIO: AÑADIMOS EL MÉTODO PARA ABRIR COMENTARIOS ---
  openCommentsModal(threadId: number): void {
    this.dialog.open(Comments, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { threadId: threadId },
      panelClass: 'comments-dialog-container',
    });
  }

  /**
   * Convierte el DTO de la API (ThreadResponse) al Modelo de Vista (FeedThreadDto).
   * VERSIÓN CORREGIDA Y COMPLETA.
   */
  private mapDtoToViewModel(dto: ThreadResponse): FeedThreadDto {
    // Fallback por si la API devuelve datos incompletos.
    const author = dto.author || {
      id: -1,
      username: 'unknown',
      displayName: 'Usuario Desconocido',
      avatarUrl: '',
      isFollowing: false,
      followersCount: 0,
      followingCount: 0,
    };

    return {
      id: dto.id,
      user: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatarUrl: author.avatarUrl || 'assets/images/default-avatar.png',
        isFollowing: author.isFollowing || false,
        followersCount: author.followersCount || 0,
        followingCount: author.followingCount || 0,
      },
      publicationDate: dto.createdAt,
      posts: dto.posts,
      stats: dto.stats,
      // --- CAMBIO: AÑADIMOS LA CATEGORÍA ---
      categoryName: dto.categoryName || undefined, // Asume que ThreadResponse ahora tiene 'categoryName'

      // Estos valores son placeholders. `ThreadState` los corregirá con el estado real si ya existe.
      isLiked: false,
      isSaved: false,
    };
  }
}
