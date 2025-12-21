import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface InteractionCount {
  remaining: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class InteractionCounter {
  // Inyección funcional moderna
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  // Estado reactivo mediante Signals
  public readonly remainingInteractions = signal<number | null>(null);
  public readonly interactionLimit = signal<number | null>(null);

  /**
   * Carga el estado inicial desde la API y actualiza los signals locales.
   * @returns Observable con los datos de interacción.
   */
  public fetchInitialCount(): Observable<InteractionCount> {
    const url = `${this.apiUrl}/users/me/interactions`;
    return this.http.get<InteractionCount>(url).pipe(
      tap((count) => {
        this.remainingInteractions.set(count.remaining);
        this.interactionLimit.set(count.limit);
      })
    );
  }

  /**
   * Decrementa el contador localmente sin bajar de 0.
   */
  public decrementCount(): void {
    this.remainingInteractions.update((current) =>
      current !== null && current > 0 ? current - 1 : 0
    );
  }

  /**
   * Incrementa el contador localmente respetando el límite máximo.
   */
  public incrementCount(): void {
    this.remainingInteractions.update((current) => {
      const limit = this.interactionLimit();
      // Solo incrementamos si el valor no es nulo y es menor que el límite.
      if (current !== null && limit !== null && current < limit) {
        return current + 1;
      }
      return current; // Si no, devolvemos el valor actual.
    });
  }
}
