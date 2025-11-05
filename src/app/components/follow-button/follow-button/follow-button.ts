import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { UserInterface } from '../../../interfaces/UserInterface';
import { FollowButtonService } from '../../../services/follow-button/follow-button';
import { CommonModule } from '@angular/common';
import { ConfirmMatDialog } from '../../mat-dialog/mat-dialog/mat-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-follow-button',
  imports: [CommonModule],
  templateUrl: './follow-button.html',
  styleUrl: './follow-button.css'
})
export class FollowButton {
  // --- INYECCIÓN DE SERVICIOS ---
  private followService = inject(FollowButtonService);
  private dialog = inject(MatDialog); // <-- Usamos el MatDialog estándar

  // --- PROPIEDADES ---
  isLoading = false;
  isHovering = false;

  @Input({ required: true }) user!: UserInterface;
  @Output() followStateChanged = new EventEmitter<boolean>();

  constructor() {}

  /**
   * Gestiona el clic en el botón.
   * Si el usuario ya está siguiendo, muestra una modal de confirmación.
   * Si no, ejecuta la acción de seguir directamente.
   */
  onClickFollow(): void {
    if (this.isLoading) return;

    if (this.user.isFollowing) {
      // Muestra la modal porque es una acción de "dejar de seguir"
      this.openUnfollowConfirmDialog();
    } else {
      // Ejecuta la acción de "seguir" directamente
      this.toggleFollowState();
    }
  }

  /**
   * Abre la modal de confirmación y actúa según la respuesta del usuario.
   */
  private openUnfollowConfirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      width: '350px',
      data: {
        title: `Dejar de seguir a @${this.user.username}`,
        message: 'Sus hilos ya no aparecerán en tu feed de "Siguiendo". ¿Estás seguro?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // El 'result' será 'true' si el usuario hizo clic en "Confirmar"
      if (result === true) {
        this.toggleFollowState();
      }
    });
  }

  /**
   * Contiene la lógica principal de la actualización optimista y la llamada a la API.
   * Es llamado directamente o después de la confirmación de la modal.
   */
  private toggleFollowState(): void {
    this.isLoading = true;
    
    // Guardamos el estado anterior para poder revertir en caso de error
    const previousFollowingState = this.user.isFollowing;

    // Actualización optimista de la UI
    this.user.isFollowing = !this.user.isFollowing;

    // Llamada a la API
    this.followService.toggleFollow(this.user.username).subscribe({
      next: () => {
        // Si la API tiene éxito, emitimos el evento al componente padre
        this.followStateChanged.emit(this.user.isFollowing);
        this.isLoading = false;
      },
      error: (err) => {
        // Si la API falla, revertimos el estado en la UI
        console.error('Error al actualizar el estado de seguimiento', err);
        this.user.isFollowing = previousFollowingState;
        this.isLoading = false;
        // Opcional: mostrar un mensaje de error tipo "toast"
      }
    });
  }
}
