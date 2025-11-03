import { Component, inject, OnInit } from '@angular/core';
import { FeedService } from '../../services/feedService/feed';
import { MatDialog } from '@angular/material/dialog';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Comments } from '../../components/comments/comments';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';
import { CreateThreadButton } from '../../components/create-thread-button/create-thread-button';
import { Thread } from '../../components/thread/thread';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';
import { ThreadState } from '../../services/thread-state/thread-state';
import { FollowingDiscovering } from "../../components/following-discovering/following-discovering";
import { Suggestions } from "../../components/suggestions/suggestions";

@Component({
  selector: 'app-discover',
  imports: [BottonNav, Header, CreateThreadButton, Thread, FollowingDiscovering, Suggestions],
  templateUrl: './discover.html',
  styleUrl: './discover.css',
})
export class Discover implements OnInit {
  private feedService = inject(FeedService);
  public dialog = inject(MatDialog);
  private threadStateService = inject(ThreadState);

 // --- Propiedades de Estado (Refactorizadas) ---
 threadIds: number[] = []; // <-- SOLO GUARDAMOS IDs
 isLoading = false;
 currentPage = 0;
 isLastPage = false;

 ngOnInit(): void {
   this.loadMoreThreads(); // Carga inicial
 }

 /**
  * Carga la siguiente página de hilos para la sección "Descubrir".
  */
 loadMoreThreads(): void {
   if (this.isLoading || this.isLastPage) return;
   this.isLoading = true;

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

 /**
  * Abre la modal de comentarios.
  */
 openCommentsModal(threadId: number): void {
   this.dialog.open(Comments, {
     width: '700px',
     maxWidth: '95vw',
     maxHeight: '90vh',
     data: { threadId: threadId },
     panelClass: 'comments-dialog-container',
   });
 }
}
