import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Interaction } from '../interactionService/interaction';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThreadState {

  private interactionService = inject(Interaction);
  
 // La clave es el 'id' del hilo, el valor es una Señal (Signal) que contiene el hilo.
  // Usar una señal para cada hilo hace que los cambios sean extremadamente granulares y performantes.
  private threadsMap = new Map<number, WritableSignal<FeedThreadDto>>();

  private commentAddedSubscription: Subscription;
  private saveToggledSubscription: Subscription;

  constructor() {

    this.commentAddedSubscription = this.interactionService.commentAdded$.subscribe(event => {
      this.incrementCommentCount(event.threadId);
    });
    

    this.saveToggledSubscription = this.interactionService.saveToggled$.subscribe(event => {
      this.updateSaveState(event.threadId, event.isSaved);
    });

   }


   ngOnDestroy() {
    this.commentAddedSubscription?.unsubscribe();
    this.saveToggledSubscription?.unsubscribe();
  }
  /**
   * Carga o actualiza los hilos en el store.
   * Si un hilo ya existe, actualiza sus datos base pero PRESERVA su estado de interacción.
   */
  loadThreads(threads: FeedThreadDto[]): void {
    threads.forEach(thread => {
      const existingSignal = this.threadsMap.get(thread.id);
      if (existingSignal) {
        // El hilo ya existe, actualizamos sus datos pero mantenemos isLiked/isSaved
        existingSignal.update(currentValue => ({
          ...thread, // Nuevos datos de la API
          isLiked: currentValue.isLiked, // Mantenemos el estado de like existente
          isSaved: currentValue.isSaved, // Mantenemos el estado de guardado existente
        }));
      } else {
        // Es un hilo nuevo, lo añadimos al mapa
        this.threadsMap.set(thread.id, signal(thread));
      }
    });
  }

  /**
   * Obtiene la señal de un hilo específico por su ID.
   * Gets the signal of a specific thread by its ID.
   */
  getThreadSignal(id: number): WritableSignal<FeedThreadDto> | undefined {
    return this.threadsMap.get(id);
  }

  /**
   * Actualiza el estado de 'like' de un hilo.
   * update the state of 'like' of a thread.
   */
  updateLikeState(threadId: number, isLiked: boolean, newLikeCount: number): void {
    const threadSignal = this.threadsMap.get(threadId);
    if (threadSignal) {
      threadSignal.update(thread => ({
        ...thread,
        isLiked: isLiked,
        stats: { ...thread.stats, likes: newLikeCount }
      }));
    }
  }
  
  // Actualiza el estado de 'guardado' de un hilo.
  // update the state of 'saved' of a thread.
  updateSaveState(threadId: number, isSaved: boolean): void {
    const threadSignal = this.threadsMap.get(threadId);
    if (threadSignal) {
      threadSignal.update(thread => ({
        ...thread,
        isSaved: isSaved,
        stats: { ...thread.stats, saves: thread.stats.saves + (isSaved ? 1 : -1) }
      }));
    }
  }

  updateThreadData(threadId: number, fullThreadData: FeedThreadDto): void {
    const threadSignal = this.threadsMap.get(threadId);
    if (threadSignal) {
      // La función 'update' recibe el valor actual del hilo en el store
      threadSignal.update(currentThread => {
        // Creamos un nuevo objeto
        return {
          // Copiamos todos los datos nuevos y completos que vienen de la API
          ...currentThread,
          // Y SOBRESCRIBIMOS 'isLiked' y 'isSaved' con los valores que YA TENÍAMOS guardados
          // en el estado actual del store, que son la fuente de la verdad de la interacción.
          isLiked: fullThreadData.isLiked,
          isSaved: fullThreadData.isSaved
        };
      });
    }
  }


  private incrementCommentCount(threadId: number): void {
    const threadSignal = this.threadsMap.get(threadId);
    if (threadSignal) {
      console.log(`[Store] Incrementando contador de comentarios para el hilo ID: ${threadId}`);
      threadSignal.update(thread => ({
        ...thread,
        stats: { ...thread.stats, comments: thread.stats.comments + 1 }
      }));
    } else {
      console.warn(`[Store] Se recibió una notificación de comentario para el hilo ID ${threadId}, pero no se encontró en el store.`);
    }
  }


  removeThread(threadId: number): void {
    this.threadsMap.delete(threadId);
    
  }

}