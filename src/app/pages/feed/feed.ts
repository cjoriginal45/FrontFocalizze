import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Suggestions } from '../../components/suggestions/suggestions';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';
import { CreateThreadButton } from '../../components/create-thread-button/create-thread-button';
import { FollowingDiscovering } from '../../components/following-discovering/following-discovering';
import { Thread } from '../../components/thread/thread';
import { MatDialog } from '@angular/material/dialog';
import { Comments } from '../../components/comments/comments';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { FeedService } from '../../services/feedService/feed';
import { Interaction } from '../../services/interactionService/interaction';
import { Subscription } from 'rxjs';
import { ThreadState } from '../../services/thread-state/thread-state';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [Header, FollowingDiscovering, Thread, Suggestions, BottonNav, CreateThreadButton],
  templateUrl: './feed.html',
  styleUrls: ['./feed.css'],
})
export class Feed implements OnInit { // Ya no necesitas OnDestroy aquí
  // --- Inyección de Dependencias ---
  private feedService = inject(FeedService);
  private threadStateService = inject(ThreadState);
  public dialog = inject(MatDialog);

  // --- Propiedades de Estado (Refactorizadas) ---
  threadIds: number[] = []; // <-- SOLO GUARDAMOS IDs
  isLoading = false;
  currentPage = 0;
  isLastPage = false;

  ngOnInit(): void {
    this.loadMoreThreads(); // Carga inicial
  }

  /**
   * Carga la siguiente página de hilos.
   */
  loadMoreThreads(): void {
    if (this.isLoading || this.isLastPage) return;
    this.isLoading = true;

    // 1. El servicio devuelve la página con los datos ya en el formato correcto.
    this.feedService.getFeed(this.currentPage, 10).subscribe({
      next: (page) => {
        // 2. EXTRAEMOS los datos directamente. ¡NO HAY MAPEO!
        const newThreads: FeedThreadDto[] = page.content;

        // 3. Cargamos los datos en el store.
        this.threadStateService.loadThreads(newThreads);

        // 4. Guardamos los IDs.
        const newThreadIds = newThreads.map(t => t.id);
        this.threadIds.push(...newThreadIds);

        this.isLastPage = page.last;
        this.currentPage++;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los hilos del feed', err);
        this.isLoading = false;
      },
    });
  }
  
  // (El manejo de comentarios se moverá al ThreadStateService para ser global)
  // private listenForCommentUpdates(): void { ... }

  openCommentsModal(threadId: number): void {
    this.dialog.open(Comments, { /* ... */ });
  }
}
