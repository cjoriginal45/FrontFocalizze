import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommentAddedEvent } from '../../interfaces/CommentAddedEvent';

@Injectable({
  providedIn: 'root',
})
export class Interaction {
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
    console.log(`InteractionService: Notificando que se añadió un comentario al hilo ${threadId}`);
    this._commentAddedSource.next({ threadId });
  }
}
