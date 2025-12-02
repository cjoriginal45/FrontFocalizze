import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InteractionCounter } from '../../services/interactionCounter/interaction-counter';
import { Auth } from '../../services/auth/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-following-discovering',
  standalone: true,
  imports: [
    RouterLink,
    TranslateModule
  ],
  templateUrl: './following-discovering.html',
  styleUrl: './following-discovering.css',
})
export class FollowingDiscovering implements OnInit{
  public interactionCounterService = inject(InteractionCounter);
  public authService = inject(Auth); // Para saber si el usuario está logueado

  constructor() {
    // --- ¡LA SOLUCIÓN! ---
    // effect() crea una reacción que se ejecuta inmediatamente Y
    // cada vez que una de las señales que lee ('isLoggedIn') cambia.
    effect(() => {
      // Leemos la señal. Esto crea la dependencia reactiva.
      const isLoggedIn = this.authService.isLoggedIn();
      
      console.log(`[FollowingDiscovering] El estado de login es: ${isLoggedIn}.`);
      
      if (isLoggedIn) {
        // Si el usuario está logueado (o acaba de loguearse),
        // llamamos a la API para obtener el contador.
        this.interactionCounterService.fetchInitialCount().subscribe();
      } else {
        // Si el usuario cierra sesión, reseteamos los contadores.
        this.interactionCounterService.remainingInteractions.set(null);
        this.interactionCounterService.interactionLimit.set(null);
      }
    });
  }

  ngOnInit(): void {
    // Si el usuario está logueado, cargamos el contador inicial
    if (this.authService.isLoggedIn()) {
      this.interactionCounterService.fetchInitialCount().subscribe();
    }
  }

}
