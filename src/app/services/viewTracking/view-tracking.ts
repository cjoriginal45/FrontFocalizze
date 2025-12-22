import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViewTracking {
  private readonly STORAGE_KEY = 'focalizze_viewed_threads';

  // Usamos un Set para un acceso y comprobación súper rápidos.
  private viewedThreads = new Set<number>();

  constructor() {
    // Al iniciar el servicio, cargamos los IDs desde sessionStorage.
    // Esto "recuerda" los hilos vistos si el usuario recarga la página.
    const storedViews = sessionStorage.getItem(this.STORAGE_KEY);
    if (storedViews) {
      this.viewedThreads = new Set(JSON.parse(storedViews));
    }
  }

  /**
   * Comprueba si un hilo ya ha sido marcado como visto en esta sesión.
   */
  hasBeenViewed(threadId: number): boolean {
    return this.viewedThreads.has(threadId);
  }

  /**
   * Marca un hilo como visto y lo guarda en sessionStorage.
   */
  markAsViewed(threadId: number): void {
    this.viewedThreads.add(threadId);
    // Guardamos el Set como un array en el storage.
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(this.viewedThreads)));
  }

  /**
   * Limpia el historial de vistas. Se debe llamar al cerrar sesión.
   */
  clearViewedThreads(): void {
    this.viewedThreads.clear();
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
