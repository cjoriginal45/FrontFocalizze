import { Component, inject, OnInit } from '@angular/core';
import { FeedService } from '../../services/feedService/feed';
import { MatDialog } from '@angular/material/dialog';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Comments } from '../../components/comments/comments';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';
import { CreateThreadButton } from '../../components/create-thread-button/create-thread-button';
import { Thread } from '../../components/thread/thread';

@Component({
  selector: 'app-discover',
  imports: [BottonNav, Header, CreateThreadButton, Thread],
  templateUrl: './discover.html',
  styleUrl: './discover.css',
})
export class Discover implements OnInit {
  private feedService = inject(FeedService);
  public dialog = inject(MatDialog);

  // Propiedades para manejar el estado de la carga y los datos
  // Properties to manage the loading state and data
  threads: FeedThreadDto[] = []; // Array vacío para almacenar los hilos de la API / Empty array to store API threads
  isLoading = false; // Booleano para saber si estamos esperando una respuesta / Boolean to know if we are waiting for a response
  currentPage = 0; // Contador para la paginación / Counter for pagination
  isLastPage = false; // Booleano para detener las llamadas cuando no haya más datos / Boolean to stop calls when there is no more data

  ngOnInit(): void {
    this.loadThreads();
  }

  // Lógica de negocio para obtener los datos
  // Business logic to get the data
  loadThreads(): void {
    // Prevenimos llamadas múltiples si ya está cargando o si ya se cargó todo
    // We prevent multiple calls if it is already loading or if everything has already loaded
    if (this.isLoading || this.isLastPage) {
      return;
    }

    this.isLoading = true; // Marcamos como "cargando" / // We mark as "loading"

    this.feedService.getFeed(this.currentPage, 10).subscribe({
      next: (page) => {
        // Usamos el spread operator (...) para AÑADIR los nuevos hilos sin borrar los antiguos
        // We use the spread operator (...) to ADD the new threads without deleting the old ones
        this.threads = [...this.threads, ...page.content];
        this.isLastPage = page.last; // Actualizamos si es la última página / We update if it is the last page
        this.isLoading = false; // Marcamos como "carga finalizada" / We mark it as "loading completed"
      },
      error: (err) => {
        console.error('Error al cargar los hilos del feed', err);
        this.isLoading = false; // Marcamos como "carga finalizada" incluso si hay error / We mark it as "loading completed" even if there is an error
      },
    });
  }

  // Función para la paginación (ej. un botón "Cargar más")
  // Function for pagination (in a "Load More" button)
  loadMore(): void {
    if (!this.isLastPage) {
      this.currentPage++; // Incrementamos el número de página / We increased the page number
      this.loadThreads(); // Y volvemos a llamar a la función de carga / And we call the load function again
    }
  }

  // Método para abrir comentarios
  // Method for opening comments
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
