import { Component, inject, effect, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';

import { InteractionCounter } from '../../services/interactionCounter/interaction-counter';
import { Auth } from '../../services/auth/auth';

/**
 * Componente que gestiona las pestañas de navegación del feed (Siguiendo/Descubrir)
 * y muestra el contador de interacciones diarias.
 */
@Component({
  selector: 'app-following-discovering',
  standalone: true,
  imports: [RouterLink, TranslateModule, RouterModule],
  templateUrl: './following-discovering.html',
  styleUrl: './following-discovering.css',
  // OnPush mejora el rendimiento, delegando la actualización a los Signals
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowingDiscovering {
  // --- Inyección de dependencias ---
  public readonly interactionCounterService = inject(InteractionCounter);
  public readonly authService = inject(Auth);

  constructor() {
    /**
     * El effect() se ejecuta automáticamente al inicio y cada vez que
     * la señal 'isLoggedIn' cambie de valor.
     */
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();

      if (isLoggedIn) {
        // Ejecutamos la carga inicial. Usamos take(1) para asegurar la limpieza.
        this.interactionCounterService.fetchInitialCount()
          .pipe(take(1))
          .subscribe();
      } else {
        // Limpieza de estado al cerrar sesión
        this.resetCounters();
      }
    });
  }

  /**
   * Resetea los valores del servicio de interacciones a su estado nulo.
   */
  private resetCounters(): void {
    this.interactionCounterService.remainingInteractions.set(null);
    this.interactionCounterService.interactionLimit.set(null);
  }
}