import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommentAddedEvent } from '../../interfaces/CommentAddedEvent';
import { LikeToggledEvent } from '../../interfaces/LikeToggledEvent';
import { InteractionCounter } from '../interactionCounter/interaction-counter';

@Injectable({
  providedIn: 'root',
})
export class Interaction {

  private interactionCounterService = inject(InteractionCounter);

  private _saveToggledSource = new Subject<{ threadId: number; isSaved: boolean }>();
  saveToggled$ = this._saveToggledSource.asObservable();

  // Un Subject es como un EventEmitter que puede ser observado por múltiples componentes.
  // Lo hacemos privado para que solo este servicio pueda emitir eventos.
  // A Subject is like an EventEmitter that can be observed by multiple components.
  // We make it private so that only this service can emit events.
  private _commentAddedSource = new Subject<CommentAddedEvent>();

  // Exponemos el Subject como un Observable público.
  // Los componentes se suscribirán a este para recibir notificaciones.
  // We expose the Subject as a public Observable.
  // Components will subscribe to it to receive notifications.
  commentAdded$ = this._commentAddedSource.asObservable();

  /**
   * Este método será llamado por el componente Comments para notificar
   * que un nuevo comentario ha sido publicado.
   * @param threadId El ID del hilo que recibió el nuevo comentario.
   *
   * This method will be called by the Comments component to notify
   * that a new comment has been posted.
   * @param threadId The ID of the thread that received the new comment.
   */
  notifyCommentAdded(threadId: number): void {
    this._commentAddedSource.next({ threadId });
    // Decrementamos el contador global
    this.interactionCounterService.decrementCount();
  }
  private _likeToggledSource = new Subject<LikeToggledEvent>();
  likeToggled$ = this._likeToggledSource.asObservable();

  /**
   * Notifica que el estado de "like" de un hilo ha cambiado.
   * @param threadId El ID del hilo afectado.
   * @param isLiked El nuevo estado del "like" (true si se dio, false si se quitó).
   *
   * * Notifies that a thread's like status has changed.
   * @param threadId The ID of the affected thread.
   * @param isLiked The new like status (true if liked, false if unliked).
   */
  notifyLikeToggled(threadId: number, isLiked: boolean): void {
    this._likeToggledSource.next({ threadId, isLiked });
    // Solo decrementamos si se dio un like, no si se quitó
    if (isLiked) {
      // Si se dio un like, decrementamos.
      this.interactionCounterService.decrementCount();
    } else {
      // Si se quitó un like, incrementamos (reembolsamos).
      this.interactionCounterService.incrementCount();
    }
  }

  notifySaveToggled(threadId: number, isSaved: boolean): void {
    this._saveToggledSource.next({ threadId, isSaved });
}
  
}