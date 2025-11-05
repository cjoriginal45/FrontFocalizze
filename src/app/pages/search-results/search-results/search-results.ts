import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Thread } from '../../../components/thread/thread';
import { ActivatedRoute, Router } from '@angular/router';
import { Search } from '../../../services/search/search';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { switchMap } from 'rxjs';
import { ThreadResponse } from '../../../interfaces/ThreadResponseDto';
import { UserInterface } from '../../../interfaces/UserInterface';
import { Header } from '../../../components/header/header';
import { FollowingDiscovering } from '../../../components/following-discovering/following-discovering';
import { ThreadState } from '../../../services/thread-state/thread-state';

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
  private threadStateService = inject(ThreadState); // <-- Inyectamos el store
  private router = inject(Router);

  // --- Propiedades de Estado (Refactorizadas) ---
  threadIds: number[] = []; // <-- AHORA SOLO GUARDAMOS IDs
  query = '';
  isLoading = true;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((params) => {
          this.isLoading = true;
          this.threadIds = []; // Limpiamos los IDs de resultados anteriores
          this.query = params.get('q') || '';

          if (this.query) {
            return this.searchService.searchContent(this.query);
          }
          return [];
        })
      )
      .subscribe({
        next: (results) => {
          // 'results' es de tipo ThreadResponse[]
          // 1. Mapeamos los DTOs de la API a los Modelos de Vista.
          const mappedThreads: FeedThreadDto[] = results.map((dto) => this.mapDtoToViewModel(dto));

          // 2. Cargamos/actualizamos los hilos en el store centralizado.
          this.threadStateService.loadThreads(mappedThreads);

          // 3. Obtenemos solo los IDs de los hilos encontrados.
          this.threadIds = mappedThreads.map((t) => t.id);

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al buscar contenido', err);
          this.isLoading = false;
        },
      });
  }

  goBack(): void {
    window.history.back();
  }

  /**
   * Convierte el DTO de la API (ThreadResponse) al Modelo de Vista (FeedThreadDto).
   */
  private mapDtoToViewModel(dto: ThreadResponse): FeedThreadDto {
    if (!dto || !dto.author) {
      console.warn('DTO inválido encontrado, usando fallback:', dto);
      // ... (tu lógica de fallback que ya estaba bien)
    }
    return {
      id: dto.id,
      user: {
        id: dto.author.id,
        username: dto.author.username,
        displayName: dto.author.displayName, // 'name' debe coincidir con tu interfaz UserInterface
        avatarUrl: dto.author.avatarUrl || 'assets/images/default-avatar.png',
        isFollowing: dto.author.isFollowing || false,
      },
      publicationDate: dto.createdAt,
      posts: dto.posts,
      stats: dto.stats,
      isLiked: false, // O usa 'dto.isLiked' si el backend lo envía
      isSaved: false,
    };
  }
}
