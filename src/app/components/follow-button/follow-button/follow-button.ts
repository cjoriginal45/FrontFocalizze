import { Component, inject, Input } from '@angular/core';
import { UserInterface } from '../../../interfaces/UserInterface';
import { FollowButtonService } from '../../../services/follow-button/follow-button';

@Component({
  selector: 'app-follow-button',
  imports: [],
  templateUrl: './follow-button.html',
  styleUrl: './follow-button.css'
})
export class FollowButton {
// --- INYECCIÓN DE SERVICIOS ---
private followService = inject(FollowButtonService);

// --- INPUT ---
// El componente recibe el objeto de usuario completo
@Input({ required: true }) user!: UserInterface;

isLoading = false;

constructor() {}

toggleFollow(): void {
  // Evita múltiples clics mientras la petición está en curso
  if (this.isLoading) {
    return;
  }
  this.isLoading = true;

  // Guardamos el estado anterior para poder revertir en caso de error
  const previousFollowingState = this.user.isFollowing;

  // 1. ACTUALIZACIÓN OPTIMISTA: Cambiamos el estado en la UI inmediatamente
  this.user.isFollowing = !this.user.isFollowing;

  // 2. LLAMADA A LA API
  this.followService.toggleFollow(this.user.username).subscribe({
    next: () => {
      // La API tuvo éxito, la UI ya está actualizada. No hacemos nada.
      console.log(`Estado de seguimiento para ${this.user.username} actualizado con éxito.`);
      this.isLoading = false;
    },
    error: (err) => {
      // La API falló, revertimos el cambio en la UI.
      console.error('Error al actualizar el estado de seguimiento', err);
      this.user.isFollowing = previousFollowingState;
      this.isLoading = false;
      // Aquí podrías mostrar un mensaje de error (toast)
    }
  });
}
}
