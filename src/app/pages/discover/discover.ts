import { Component, inject, OnInit, signal } from '@angular/core';
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
import { FollowingDiscovering } from '../../components/following-discovering/following-discovering';
import { Suggestions } from '../../components/suggestions/suggestions';
import { DiscoverFeed } from '../../services/discover-feed/discover-feed';
import { UserState } from '../../services/user-state/user-state';
import { DiscoverItemDto } from '../../interfaces/DiscoverItemDto';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-discover',
  imports: [
    CommonModule,
    Header,
    FollowingDiscovering,
    Thread,
    Suggestions,
    BottonNav,
    CreateThreadButton,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './discover.html',
  styleUrl: './discover.css',
})
export class Discover implements OnInit {
  private discoverFeedService = inject(DiscoverFeed);
  private threadStateService = inject(ThreadState);
  private userStateService = inject(UserState);
  public dialog = inject(MatDialog);

  // --- Estado con Signals ---
  discoverItems = signal<DiscoverItemDto[]>([]);
  isLoading = signal(false);
  isLastPage = signal(false);

  private currentPage = 0;
  private readonly pageSize = 10;

  ngOnInit(): void {
    this.loadMoreItems();
  }

  loadMoreItems(): void {
    if (this.isLoading() || this.isLastPage()) return;
    this.isLoading.set(true);

    this.discoverFeedService.getDiscoverFeed(this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        const newItems = page.content;
        if (newItems.length === 0) {
          this.isLastPage.set(true);
          this.isLoading.set(false);
          return;
        }

        // Cargamos los datos de hilos y usuarios en sus respectivos stores
        const threadsToLoad = newItems.map((item) => item.thread);
        const usersToLoad = newItems.map((item) => item.thread.user);
        this.threadStateService.loadThreads(threadsToLoad);
        this.userStateService.loadUsers(usersToLoad);

        // Actualizamos la lista de items a mostrar
        this.discoverItems.update((currentItems) => [...currentItems, ...newItems]);

        this.isLastPage.set(page.last);
        this.currentPage++;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el feed de "Descubrir"', err);
        this.isLoading.set(false);
      },
    });
  }

  onSeeLess(item: DiscoverItemDto): void {
    // 1. Actualización Optimista (lo borramos de la vista inmediatamente)
    this.discoverItems.update((items) => items.filter((i) => i.thread.id !== item.thread.id));

    // 2. Llamada al Backend (para que no vuelva a salir al recargar)
    this.discoverFeedService.hideThread(item.thread.id, item.recommendationType).subscribe({
      next: () => console.log('Hilo ocultado permanentemente'),
      error: (err) => console.error('Error al ocultar hilo', err),
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
}
