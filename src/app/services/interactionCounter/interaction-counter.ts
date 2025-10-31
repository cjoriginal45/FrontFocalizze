import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface InteractionCount {
  remaining: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class InteractionCounter {
  private apiUrl = environment.apiBaseUrl;

  remainingInteractions = signal<number | null>(null);
  interactionLimit = signal<number | null>(null);

  constructor(private http: HttpClient) { }

  // Carga el estado inicial desde la API
  fetchInitialCount() {
    return this.http.get<InteractionCount>(this.apiUrl+'/users/me/interactions').pipe(
      tap(count => {
        this.remainingInteractions.set(count.remaining);
        this.interactionLimit.set(count.limit);
      })
    );
  }

  // Decrementa el contador localmente
  decrementCount() {
    this.remainingInteractions.update(current => (current !== null && current > 0) ? current - 1 : 0);
  }
}
