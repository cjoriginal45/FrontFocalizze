import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Comments } from '../../../components/comments/comments';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { ThreadState } from '../../../services/thread-state/thread-state';
import { savedThreadsService } from '../../../services/savedThreadsService/saved-threads';
import { BottonNav } from "../../../components/botton-nav/botton-nav";
import { Header } from "../../../components/header/header";
import { Thread } from "../../../components/thread/thread";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-saved-threads',
  imports: [BottonNav, Header, Thread, MatIcon],
  templateUrl: './saved-threads.html',
  styleUrl: './saved-threads.css'
})
export class SavedThreads implements OnInit {
  // --- Inyección de Dependencias ---
  private savedThreadsService = inject(savedThreadsService);
  private threadStateService = inject(ThreadState);
  public dialog = inject(MatDialog);

  // --- Propiedades de Estado ---
  threadIds: number[] = [];
  isLoading = false;
  currentPage = 0;
  isLastPage = false;

  ngOnInit(): void {
    this.loadMoreThreads();

    this.threadStateService.threadDeleted$.subscribe(deletedThreadId => {
      console.log(`[FeedComponent] Recibida notificación para eliminar el hilo ID: ${deletedThreadId}`);
      // Eliminamos el ID de nuestra lista local para que deje de renderizarse.
      this.threadIds = this.threadIds.filter(id => id !== deletedThreadId);
    });
  }

  loadMoreThreads(): void {
    if (this.isLoading || this.isLastPage) return;
    this.isLoading = true;

    this.savedThreadsService.getSavedThreads(this.currentPage, 10).subscribe({
      next: (page) => {
        const newThreads: FeedThreadDto[] = page.content;
        this.threadStateService.loadThreads(newThreads);
        const newThreadIds = newThreads.map(t => t.id);
        this.threadIds.push(...newThreadIds);

        this.isLastPage = page.last;
        this.currentPage++;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los hilos guardados', err);
        this.isLoading = false;
      },
    });
  }
  
  openCommentsModal(threadId: number): void {
    this.dialog.open(Comments, { /* ... */ });
  }

  goBack(): void {
    window.history.back();
  }
}
