import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InteractionCounter } from '../../services/interactionCounter/interaction-counter';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-following-discovering',
  imports: [RouterLink],
  templateUrl: './following-discovering.html',
  styleUrl: './following-discovering.css',
})
export class FollowingDiscovering implements OnInit{
  public interactionCounterService = inject(InteractionCounter);
  public authService = inject(Auth); // Para saber si el usuario está logueado

  ngOnInit(): void {
    // Si el usuario está logueado, cargamos el contador inicial
    if (this.authService.isLoggedIn()) {
      this.interactionCounterService.fetchInitialCount().subscribe();
    }
  }

}
