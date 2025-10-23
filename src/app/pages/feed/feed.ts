import { Component, inject } from '@angular/core';
import { Suggestions } from '../../components/suggestions/suggestions';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';
import { CreateThreadButton } from '../../components/create-thread-button/create-thread-button';
import { FollowingDiscovering } from '../../components/following-discovering/following-discovering';
import { Thread, ThreadDto } from '../../components/thread/thread';
import { MatDialog } from '@angular/material/dialog';
import { Comments } from '../../components/comments/comments';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { FeedService } from '../../services/feedService/feed';

@Component({
  selector: 'app-feed',
  imports: [Suggestions, BottonNav, Header, CreateThreadButton, FollowingDiscovering, Thread],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  private feedService = inject(FeedService);
  public dialog = inject(MatDialog);

  // --- Propiedades para manejar el estado de la carga y los datos ---
  threads: FeedThreadDto[] = []; // Array vacío para almacenar los hilos de la API
  isLoading = false; // Booleano para saber si estamos esperando una respuesta
  currentPage = 0; // Contador para la paginación
  isLastPage = false; // Booleano para detener las llamadas cuando no haya más datos

  // El método ngOnInit se ejecuta una vez que el componente se ha inicializado
  ngOnInit(): void {
    // Iniciamos la carga de la primera página de hilos
    this.loadThreads();
  }

  // --- Lógica de negocio para obtener los datos ---
  loadThreads(): void {
    // Prevenimos llamadas múltiples si ya está cargando o si ya se cargó todo
    if (this.isLoading || this.isLastPage) {
      return;
    }

    this.isLoading = true; // Marcamos como "cargando"

    // Llamamos al método getFeed de nuestro servicio
    this.feedService.getFeed(this.currentPage, 10).subscribe({
      next: (page) => {
        // Usamos el spread operator (...) para AÑADIR los nuevos hilos sin borrar los antiguos
        this.threads = [...this.threads, ...page.content];
        this.isLastPage = page.last; // Actualizamos si es la última página
        this.isLoading = false; // Marcamos como "carga finalizada"
      },
      error: (err) => {
        console.error('Error al cargar los hilos del feed', err);
        this.isLoading = false; // Marcamos como "carga finalizada" incluso si hay error
      },
    });
  }

  // --- Función para la paginación (ej. un botón "Cargar más") ---
  loadMore(): void {
    if (!this.isLastPage) {
      this.currentPage++; // Incrementamos el número de página
      this.loadThreads(); // Y volvemos a llamar a la función de carga
    }
  }

  // --- Tu método para abrir comentarios (no cambia) ---
  openCommentsModal(postId: number): void {
    this.dialog.open(Comments, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        postId: postId,
      },
      panelClass: 'comments-dialog-container',
    });
  }
}
