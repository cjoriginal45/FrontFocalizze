import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Like } from '../../services/likeService/like';
import { Interaction } from '../../services/interactionService/interaction';
import { threadService } from '../../services/thread/thread';
import { Save } from '../../services/saveService/save';

@Component({
  selector: 'app-thread',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './thread.html',
  styleUrl: './thread.css',
})
export class Thread {
  private likeService = inject(Like);
  private interactionService = inject(Interaction);
  private threadService = inject(threadService);
  private saveService = inject(Save);

  // Aceptamos el objeto completo que viene del feed.
  // El tipo ahora coincide con la respuesta de la API.
  // We accept the full object coming from the feed.
  // The type now matches the API response.
  @Input() thread!: FeedThreadDto;

  @Output() openComments = new EventEmitter<number>();

  // Esta propiedad es para el estado local del componente, se mantiene
  // This property is for the local state of the component, it is persisted

  // Propiedades de estado local
  isExpanded = false;
  isLoadingDetails = false; // Para mostrar un indicador de carga
  isFullyLoaded = false; // Para evitar llamar a la API más de una vez

  // Ya no necesitamos las propiedades duplicadas (id, user, etc.) aquí.
  // Podemos acceder a ellas directamente en el template como 'thread.id', 'thread.user', etc.
  // We no longer need the duplicate properties (id, user, etc.) here.
  // We can access them directly in the template as 'thread.id', 'thread.user', etc.

  constructor() {}

  toggleLike(): void {
    // Guardamos el estado anterior para poder revertir en caso de error
    // We save the previous state so we can revert in case of error
    const previousState = this.thread.isLiked;
    const previousCount = this.thread.stats.likes;

    // Aplicamos la actualización optimista a la UI
    // We apply optimistic updating to the UI
    this.thread.isLiked = !this.thread.isLiked;
    this.thread.stats.likes += this.thread.isLiked ? 1 : -1;

    // Llamamos a la API
    // We call the API
    this.likeService.toggleLike(this.thread.id).subscribe({
      error: (err) => {
        // Solo si hay un error, revertimos el estado
        // Only if there is an error, we revert the state
        console.error('Error al actualizar el like', err);
        this.thread.isLiked = previousState;
        this.thread.stats.likes = previousCount;
      },
      // No necesitamos hacer nada en 'next' porque la UI ya está actualizada.
      // We don't need to do anything in 'next' because the UI is already updated.
    });
  }

  toggleSave(): void {
    // 1. Guardamos el estado anterior para poder revertir en caso de error
    // 1. We save the previous state so we can revert it in case of error
    const previousState = this.thread.isSaved;
    const previousCount = this.thread.stats.saves;

    // 2. Aplicamos la actualización optimista a la UI
    // 2. We applied the optimistic update to the UI
    this.thread.isSaved = !this.thread.isSaved;
    this.thread.stats.saves += this.thread.isSaved ? 1 : -1;

    // 3. Llamamos al servicio de API para persistir el cambio
    // 3. We call the API service to persist the change
    this.saveService.toggleSave(this.thread.id).subscribe({
      error: (err) => {
        // 4. Si la API falla, revertimos los cambios en la UI
        // 4. If the API fails, we revert the UI changes
        console.error('Error al actualizar el guardado', err);
        this.thread.isSaved = previousState;
        this.thread.stats.saves = previousCount;
      },
      // No necesitamos hacer nada en 'next' porque la UI ya está actualizada.
      // We don't need to do anything in 'next' because the UI is already updated.
    });
  }

  // LÓGICA DE EXPANSIÓN
  // EXPANSION LOGIC
  toggleExpansion(): void {
    console.log(`Toggling expansion for thread ID: ${this.thread.id}. Current state: ${this.isExpanded}`);

    // Si ya está expandido, simplemente lo colapsamos
    // If it's already expanded, we just collapse it
    if (this.isExpanded) {
      this.isExpanded = false;
      return;
    }

    // Si ya hemos cargado todos los datos antes, simplemente lo volvemos a mostrar
    // If we have already loaded all the data before, we simply display it again
    if (this.isFullyLoaded) {
      this.isExpanded = true;
      return;
    }

    // Si es la primera vez que se expande, llamamos a la API
    // If it's the first time it's being expanded, we call the API
    this.isLoadingDetails = true;
    this.threadService.getThreadById(this.thread.id).subscribe({
      next: (fullThreadData) => {
        // Actualizamos nuestro objeto 'thread' local con los datos completos de la API
        // We update our local 'thread' object with the complete API data
        this.thread.posts = fullThreadData.posts;
        this.thread.stats = fullThreadData.stats; // ¡Esto actualiza el contador de vistas!

        // Marcamos que ya está completamente cargado y lo expandimos
        // We mark that it is fully loaded and expand it
        this.isFullyLoaded = true;
        this.isExpanded = true;
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error('Error al cargar los detalles del hilo', err);
        this.isLoadingDetails = false;
      },
    });

    console.log(`New state: ${this.isExpanded}`);
  }

  // LÓGICA PARA ABRIR COMENTARIOS
  // LOGIC FOR OPENING COMMENTS
  onCommentClick(): void {
    this.openComments.emit(this.thread.id);
  }
}
