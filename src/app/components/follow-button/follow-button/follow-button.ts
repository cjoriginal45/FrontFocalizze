import { Component, EventEmitter, inject, Input, OnInit, Output, WritableSignal } from '@angular/core';
import { UserInterface } from '../../../interfaces/UserInterface';
import { FollowButtonService } from '../../../services/follow-button/follow-button';
import { CommonModule } from '@angular/common';
import { ConfirmMatDialog } from '../../mat-dialog/mat-dialog/mat-dialog';
import { MatDialog } from '@angular/material/dialog';
import { UserState } from '../../../services/user-state/user-state';

@Component({
  selector: 'app-follow-button',
  imports: [CommonModule],
  templateUrl: './follow-button.html',
  styleUrl: './follow-button.css'
})
export class FollowButton implements OnInit{
  // --- INYECCIÓN DE SERVICIOS ---
  private followService = inject(FollowButtonService);
  private dialog = inject(MatDialog); 
  private userStateService = inject(UserState);
 // --- INPUT ÚNICO Y REQUERIDO ---
  // El componente solo necesita saber a QUÉ usuario afectar.
  @Input({ required: true }) username!: string;

  // --- OUTPUT (para notificar al padre) ---
  @Output() followStateChanged = new EventEmitter<boolean>();
  
  // --- SEÑAL INTERNA ---
  // Esta es la fuente de la verdad para la plantilla de ESTE componente.
  public userSignal: WritableSignal<UserInterface> | undefined;

  // --- ESTADO LOCAL ---
  isLoading = false;
  isHovering = false;

  ngOnInit(): void {
    // Al iniciar, buscamos la señal del usuario correspondiente en nuestro store central.
    this.userSignal = this.userStateService.getUserSignal(this.username);
    if (!this.userSignal) {
      console.error(`FollowButton: No se encontró el estado para el usuario @${this.username}. Asegúrate de que se carga en el store antes de renderizar este botón.`);
    }
  }

  /**
   * Gestiona el clic en el botón, mostrando una confirmación si es necesario.
   */
  onClickFollow(): void {
    if (this.isLoading || !this.userSignal) return;

    const currentUser = this.userSignal(); // Leemos el valor actual de la señal

    if (currentUser.isFollowing) {
      this.openUnfollowConfirmDialog(currentUser);
    } else {
      this.executeToggleFollow(currentUser);
    }
  }

  /**
   * Abre la modal de confirmación.
   */
  private openUnfollowConfirmDialog(user: UserInterface): void {
    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      width: '350px',
      data: {
        title: `Dejar de seguir a @${user.username}`,
        message: 'Sus hilos ya no aparecerán en tu feed de "Sigriendo". ¿Estás seguro?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.executeToggleFollow(user);
      }
    });
  }

  /**
   * Ejecuta la lógica de la llamada a la API y actualiza el estado.
   */
  private executeToggleFollow(user: UserInterface): void {
    this.isLoading = true;
    const previousFollowingState = user.isFollowing;
    const newFollowingState = !previousFollowingState;

    // 1. Actualización optimista en el store centralizado.
    //    Esto notificará a TODOS los componentes que muestren a este usuario.
    this.userStateService.updateFollowingState(this.username, newFollowingState);

    // 2. Llamada a la API.
    this.followService.toggleFollow(this.username).subscribe({
      next: () => {
        // La API tuvo éxito, emitimos el evento para que el padre actualice contadores.
        this.followStateChanged.emit(newFollowingState);
        this.isLoading = false;
      },
      error: (err) => {
        // La API falló, revertimos el estado en el store.
        console.error(`Error al seguir/dejar de seguir a @${this.username}`, err);
        this.userStateService.updateFollowingState(this.username, previousFollowingState);
        this.isLoading = false;
      }
    });
  }
}