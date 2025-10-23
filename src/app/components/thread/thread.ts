import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FeedThreadDto } from '../../interfaces/FeedThread';

@Component({
  selector: 'app-thread',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './thread.html',
  styleUrl: './thread.css',
})
export class Thread {
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
    // Cambiamos el estado local para una respuesta visual inmediata
    // We change the local state for immediate visual feedback
    this.thread.isLiked = !this.thread.isLiked;
    this.thread.stats.likes += this.thread.isLiked ? 1 : -1;
    console.log('Like toggled for thread:', this.thread.id);
    // TODO: Emitir evento para notificar al servicio de Likes
    // TODO: Emit event to notify the Likes service
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
