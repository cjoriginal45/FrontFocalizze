import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Interaction } from '../interactionService/interaction';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThreadState {
  private interactionService = inject(Interaction);
  private commentDeletedSubscription: Subscription;

  // La clave es el 'id' del hilo, el valor es una Señal (Signal) que contiene el hilo.
  // Usar una señal para cada hilo hace que los cambios sean extremadamente granulares y performantes.
  private threadsMap = new Map<number, WritableSignal<FeedThreadDto>>();

  private commentAddedSubscription: Subscription;
  private saveToggledSubscription: Subscription;

  private threadDeletedSource = new Subject<number>();
  threadDeleted$ = this.threadDeletedSource.asObservable();

  constructor() {
    this.commentAddedSubscription = this.interactionService.commentAdded$.subscribe((event) => {
      this.incrementCommentCount(event.threadId);
    });

    this.saveToggledSubscription = this.interactionService.saveToggled$.subscribe((event) => {
      this.updateSaveState(event.threadId, event.isSaved);
    });

    this.commentDeletedSubscription = this.interactionService.commentDeleted$.subscribe((event) => {
      this.decrementCommentCount(event.threadId);
    });
  }

  ngOnDestroy() {
    this.commentAddedSubscription?.unsubscribe();
    this.saveToggledSubscription?.unsubscribe();
    this.commentDeletedSubscription?.unsubscribe();
  }
  /**
   * Carga o actualiza los hilos en el store.
   * Si un hilo ya existe, actualiza sus datos base pero PRESERVA su estado de interacción.
   */
  loadThreads(threads: FeedThreadDto[]): void {
    threads.forEach((threadFromApi) => {
      const existingSignal = this.threadsMap.get(threadFromApi.id);
      if (existingSignal) {
        existingSignal.set(threadFromApi);
      } else {
        this.threadsMap.set(threadFromApi.id, signal(threadFromApi));
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
      threadSignal.update((thread) => ({
        ...thread,
        isLiked: isLiked,
        stats: { ...thread.stats, likes: newLikeCount },
      }));
    }
  }

  // Actualiza el estado de 'guardado' de un hilo.
  // update the state of 'saved' of a thread.
  updateSaveState(threadId: number, isSaved: boolean): void {
    const threadSignal = this.threadsMap.get(threadId);
    if (threadSignal) {
      threadSignal.update((thread) => ({
        ...thread,
        isSaved: isSaved,
        stats: { ...thread.stats, saves: thread.stats.saves + (isSaved ? 1 : -1) },
      }));
    }
  }

  updateThreadData(threadId: number, updatedDataFromApi: FeedThreadDto): void {
    // 1. Buscamos la señal del hilo en nuestro mapa.
    const threadSignal = this.threadsMap.get(threadId);

    // 2. Si no existe, no podemos hacer nada (esto no debería pasar).
    if (!threadSignal) {
      console.error(`[Store] Se intentó actualizar el hilo ID ${threadId}, pero no se encontró.`);
      return;
    }

    // 3. Usamos 'update' para modificar el estado de forma segura.
    threadSignal.update((currentThreadInStore) => {
      // 4. Creamos un nuevo objeto de estado, combinando lo mejor de ambos mundos.
      const newState: FeedThreadDto = {
        ...currentThreadInStore,

        // Y sobrescribimos solo las propiedades que sabemos que han cambiado
        // con los datos frescos que vienen de la API.
        posts: updatedDataFromApi.posts,
        categoryName: updatedDataFromApi.categoryName,
        // Opcional: la API también puede devolver stats actualizados
        stats: updatedDataFromApi.stats,
      };

      console.log('[Store] Nuevo estado fusionado:', newState);
      return newState;
    });
  }

  private incrementCommentCount(threadId: number): void {
    const threadSignal = this.threadsMap.get(threadId);
    if (threadSignal) {
      console.log(`[Store] Incrementando contador de comentarios para el hilo ID: ${threadId}`);
      threadSignal.update((thread) => ({
        ...thread,
        stats: { ...thread.stats, comments: thread.stats.comments + 1 },
      }));
    } else {
      console.warn(
        `[Store] Se recibió una notificación de comentario para el hilo ID ${threadId}, pero no se encontró en el store.`
      );
    }
  }

  removeThread(threadId: number): void {
    const wasDeleted = this.threadsMap.delete(threadId);
    if (wasDeleted) {
      // Si se borró del mapa, notificamos a los contenedores.
      console.log(`[Store] Hilo ID ${threadId} eliminado. Notificando...`);
      this.threadDeletedSource.next(threadId);
    }
  }

  clearState(): void {
    this.threadsMap.clear();
  }

  private decrementCommentCount(threadId: number): void {
    const threadSignal = this.threadsMap.get(threadId);
    if (threadSignal) {
      threadSignal.update((thread) => ({
        ...thread,
        stats: { ...thread.stats, comments: Math.max(0, thread.stats.comments - 1) },
      }));
    }
  }
}
