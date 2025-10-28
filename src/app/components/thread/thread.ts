import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Like } from '../../services/likeService/like';
import { Interaction } from '../../services/interactionService/interaction';

@Component({
  selector: 'app-thread',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './thread.html',
  styleUrl: './thread.css',
})
export class Thread {
  private likeService = inject(Like);
  private interactionService = inject(Interaction);

  // Aceptamos el objeto completo que viene del feed.
  // El tipo ahora coincide con la respuesta de la API.
  // We accept the full object coming from the feed.
  // The type now matches the API response.
  @Input() thread!: FeedThreadDto;

  @Output() openComments = new EventEmitter<number>();

  // Esta propiedad es para el estado local del componente, se mantiene
  // This property is for the local state of the component, it is persisted
  isExpanded = false;

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
    this.thread.isSaved = !this.thread.isSaved;
    console.log('Save toggled for thread:', this.thread.id);
    // TODO: Emitir evento para notificar al servicio de Guardados
    // TODO: Emit event to notify the Saved service
  }

  // LÓGICA DE EXPANSIÓN
  // EXPANSION LOGIC
  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  // LÓGICA PARA ABRIR COMENTARIOS
  // LOGIC FOR OPENING COMMENTS
  onCommentClick(): void {
    this.openComments.emit(this.thread.id);
  }
}
