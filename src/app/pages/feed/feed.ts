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
import { ActivatedRoute, Router } from '@angular/router';
import { Search } from '../../services/search/search';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';

@Component({
  selector: 'app-feed',
  imports: [Suggestions, BottonNav, Header, CreateThreadButton, FollowingDiscovering, Thread],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit, OnDestroy {
  private feedService = inject(FeedService);
  private searchService = inject(Search);
  private interactionService = inject(Interaction);
  public route = inject(ActivatedRoute); 
  private router = inject(Router);
  public dialog = inject(MatDialog);

  // Propiedades para manejar el estado de la carga y los datos
  // Properties to manage the loading state and data
  threads: FeedThreadDto[] = []; // Array vacío para almacenar los hilos de la API / Empty array to store API threads
  isLoading = false; // Booleano para saber si estamos esperando una respuesta / Boolean to know if we are waiting for a response
  currentPage = 0; // Contador para la paginación / Counter for pagination
  isLastPage = false; // Booleano para detener las llamadas cuando no haya más datos / Boolean to stop calls when there is no more data


  // -- propiedad para el título dinámico --
  pageTitle = 'Inicio';

  private routeSubscription: Subscription | undefined;
  private commentAddedSubscription: Subscription | undefined;

  ngOnInit(): void {
    // La carga inicial y las futuras cargas (por búsqueda) se manejan aquí.
    this.listenForRouteChange();
    this.listenForCommentUpdates();
  }

  ngOnDestroy(): void {
    // Limpiamos las suscripciones para evitar fugas de memoria.
    this.routeSubscription?.unsubscribe();
    this.commentAddedSubscription?.unsubscribe();
  }

  /**
   * Se suscribe a los cambios en la URL (parámetros de consulta) para decidir
   * si debe mostrar el feed principal o los resultados de una búsqueda.
   */
  private listenForRouteChange(): void {
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      const searchQuery = params.get('q');
      
      // Reiniciamos el estado para cada nueva vista (feed o búsqueda).
      this.threads = [];
      this.currentPage = 0;
      this.isLastPage = false;
      this.isLoading = true; // Inicia la carga

      if (searchQuery) {
        // MODO BÚSQUEDA
        this.pageTitle = `Resultados para: "${searchQuery}"`;
        this.loadSearchResults(searchQuery);
      } else {
        // MODO FEED PRINCIPAL ("Siguiendo")
        this.pageTitle = 'Siguiendo';
        this.loadFollowingFeed();
      }
    });
  }

  /**
   * Carga los hilos para el feed principal ("Siguiendo") de forma paginada.
   */
  private loadFollowingFeed(): void {
    if (this.isLoading && this.currentPage > 0) return; // Previene cargas múltiples en scroll
    this.isLoading = true;

    this.feedService.getFeed(this.currentPage, 10).subscribe({
      next: (page) => {
        const newThreads: FeedThreadDto[] = page.content.map(dto => this.mapDtoToViewModel(dto));
        this.threads.push(...newThreads); // Añade los nuevos hilos
        this.isLastPage = page.last;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el feed', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Carga los resultados de una búsqueda de contenido. No es paginada.
   */
  private loadSearchResults(query: string): void {
    this.searchService.searchContent(query).subscribe({
      next: (results) => {
        const newThreads: FeedThreadDto[] = results.map(dto => this.mapDtoToViewModel(dto));
        this.threads = newThreads;
        this.isLastPage = true; // La búsqueda no es paginada
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los resultados de búsqueda', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Carga la siguiente página de resultados para el feed principal.
   * No hace nada si estamos en una vista de búsqueda.
   */
  loadMore(): void {
    if (this.isLoading || this.isLastPage || this.route.snapshot.queryParamMap.has('q')) {
      return;
    }
    this.currentPage++;
    this.loadFollowingFeed();
  }

  /**
   * Convierte un DTO de respuesta de la API (ThreadResponse)
   * a un modelo de vista que la UI puede usar (FeedThreadDto).
   */
  private mapDtoToViewModel(dto: ThreadResponse): FeedThreadDto {
    return {
      id: dto.id,
      user: {
        id: dto.author.id, // Asumiendo que UserInterface tiene 'id'
        username: dto.author.username,
        displayName: dto.author.displayName, // 'name' en lugar de 'displayName' si así lo requiere UserInterface
        avatarUrl: dto.author.avatarUrl || 'assets/images/default-avatar.png'
      },
      publicationDate: dto.createdAt,
      posts: dto.posts,
      stats: dto.stats || { likes: 0, comments: 0, views: 0 },
      isLiked: false, // El estado inicial siempre es 'false' al cargar
      isSaved: false,
    };
  }
  
  /**
   * Se suscribe a eventos de nuevos comentarios para actualizar la UI en tiempo real.
   */
  private listenForCommentUpdates(): void {
    this.commentAddedSubscription = this.interactionService.commentAdded$.subscribe((event) => {
      console.log(`FeedComponent: Recibida notificación para el hilo ${event.threadId}`);
      const threadToUpdate = this.threads.find((thread) => thread.id === event.threadId);
      if (threadToUpdate) {
        threadToUpdate.stats.comments++;
      }
    });
  }

  /**
   * Abre la modal de comentarios para un hilo específico.
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