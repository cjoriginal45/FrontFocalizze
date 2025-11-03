import { Injectable, signal, WritableSignal } from '@angular/core';
import { FeedThreadDto } from '../../interfaces/FeedThread';

@Injectable({
  providedIn: 'root'
})
export class ThreadState {
  
 // La clave es el 'id' del hilo, el valor es una Señal (Signal) que contiene el hilo.
  // Usar una señal para cada hilo hace que los cambios sean extremadamente granulares y performantes.
  private threadsMap = new Map<number, WritableSignal<FeedThreadDto>>();

  constructor() { }

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
        isSaved: isSaved
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
          ...fullThreadData,
          // Y SOBRESCRIBIMOS 'isLiked' y 'isSaved' con los valores que YA TENÍAMOS guardados
          // en el estado actual del store, que son la fuente de la verdad de la interacción.
          isLiked: currentThread.isLiked,
          isSaved: currentThread.isSaved
        };
      });
    }
  }
}