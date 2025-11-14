import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Thread } from '../../../components/thread/thread';
import { ActivatedRoute, Router } from '@angular/router';
import { Search } from '../../../services/search/search';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { switchMap } from 'rxjs';
import { ThreadResponse } from '../../../interfaces/ThreadResponseDto';
import { Header } from '../../../components/header/header';
import { FollowingDiscovering } from '../../../components/following-discovering/following-discovering';
import { ThreadState } from '../../../services/thread-state/thread-state';
import { UserState } from '../../../services/user-state/user-state';
import { MatDialog } from '@angular/material/dialog';
import { Comments } from '../../../components/comments/comments';

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

  // --- Propiedades de Estado ---
  threadIds: number[] = [];
  query = '';
  isLoading = true;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((params) => {
          this.isLoading = true;
          this.threadIds = [];
          this.query = params.get('q') || '';
          if (this.query) {
            return this.searchService.searchContent(this.query);
          }
          return [];
        })
      )
      .subscribe({
        next: (results) => {
          // 1. Mapeamos los DTOs de la API a los Modelos de Vista (CON LÓGICA CORREGIDA).
          const mappedThreads: FeedThreadDto[] = results.map((dto) => this.mapDtoToViewModel(dto));

          // --- CAMBIO: SINCRONIZAMOS EL ESTADO DEL USUARIO ---
          // 2. Extraemos los usuarios de los hilos y los cargamos en el UserState.
          const usersFromThreads = mappedThreads.map((t) => t.user);
          this.userStateService.loadUsers(usersFromThreads);

          // 3. Cargamos los hilos en el store. `loadThreads` es inteligente y preservará
          //    los estados de 'isLiked' y 'isSaved' si el hilo ya existía.
          this.threadStateService.loadThreads(mappedThreads);

          // 4. Obtenemos solo los IDs para renderizar.
          this.threadIds = mappedThreads.map((t) => t.id);

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al buscar contenido', err);
          this.isLoading = false;
        },
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
