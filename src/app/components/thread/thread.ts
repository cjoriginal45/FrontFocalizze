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

  // LÓGICA DE INTERACCIÓN (POR AHORA, SOLO VISUAL)
  // A futuro, estos métodos deberían emitir eventos al padre para llamar a un servicio.
  // INTERACTION LOGIC (FOR NOW, ONLY VISUAL)
  // In the future, these methods should emit events to the parent to call a service.
  toggleLike(): void {
    // Guardamos el estado anterior y actualizamos la UI inmediatamente (Optimistic Update)
    // We save the previous state and update the UI immediately (Optimistic Update)
    const previousState = this.thread.isLiked;
    const previousCount = this.thread.stats.likes;

    this.thread.isLiked = !this.thread.isLiked;
    this.thread.stats.likes += this.thread.isLiked ? 1 : -1;

    // Notificamos a otros componentes (como el feed, si fuera necesario) a través del servicio
    // We notify other components (such as the feed, if necessary) through the service
    this.interactionService.notifyLikeToggled(this.thread.id, this.thread.isLiked);

    // Llamamos al servicio de API para persistir el cambio en el backend
    // We call the API service to persist the change to the backend
    this.likeService.toggleLike(this.thread.id).subscribe({
      next: () => {
        // La operación en el backend fue exitosa, no necesitamos hacer nada más.
        // The operation on the backend was successful, we don't need to do anything else.
        console.log(`Like para el hilo ${this.thread.id} actualizado en el servidor.`);
      },
      error: (err) => {
        // Si la API falla, revertimos los cambios en la UI para mantener la consistencia.
        // If the API fails, we roll back UI changes to maintain consistency.
        console.error('Error al actualizar el like', err);
        this.thread.isLiked = previousState;
        this.thread.stats.likes = previousCount;
        this.interactionService.notifyLikeToggled(this.thread.id, previousState);
      },
    });
  }

  toggleSave(): void {
    this.thread.isSaved = !this.thread.isSaved;
    console.log('Save toggled for thread:', this.thread.id);
    // TODO: Emitir evento para notificar al servicio de Guardados
    // TODO: Emit event to notify the Saved service
  }

  // LÓGICA DE EXPANSIÓN
  // LÓGICA DE EXPANSIÓN
  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }

  // LÓGICA PARA ABRIR COMENTARIOS
  // LOGIC FOR OPENING COMMENTS
  onCommentClick(): void {
    this.openComments.emit(this.thread.id);
  }
}
