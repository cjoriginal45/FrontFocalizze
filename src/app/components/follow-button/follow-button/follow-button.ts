import { Component, EventEmitter, inject, Input, OnInit, Output, WritableSignal } from '@angular/core';
import { UserInterface } from '../../../interfaces/UserInterface';
import { FollowButtonService } from '../../../services/follow-button/follow-button';
import { CommonModule } from '@angular/common';
import { ConfirmMatDialog } from '../../mat-dialog/mat-dialog/mat-dialog';
import { MatDialog } from '@angular/material/dialog';
import { UserState } from '../../../services/user-state/user-state';
import { Followable } from '../../../interfaces/Followable';

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



 @Input({ required: true }) type: 'user' | 'category' = 'user';
  // El objeto con los datos, que ahora es de tipo 'Followable'
  @Input({ required: true }) entity!: Followable;

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
    this.userSignal = this.userStateService.getUserSignal(this.entity.name);
    if (!this.userSignal) {
      console.error(`FollowButton: No se encontró el estado para el usuario @${this.entity.name}. Asegúrate de que se carga en el store antes de renderizar este botón.`);
    }
  }

  /**
   * Gestiona el clic en el botón, mostrando una confirmación si es necesario.
   */
  onClickFollow(): void {
    if (this.isLoading) return;

    if (this.entity.isFollowing) {
      this.openUnfollowConfirmDialog();
    } else {
      this.executeToggleFollow();
    }
  }

  /**
   * Abre la modal de confirmación.
   */
  private openUnfollowConfirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      width: '350px',
      data: {
        title: `Dejar de seguir a ${this.type === 'user' ? '@' : ''}${this.entity.name}`,
        message: `¿Estás seguro? Su contenido ya no aparecerá en tu feed principal.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.executeToggleFollow();
      }
    });
  }

  /**
   * Ejecuta la lógica de la llamada a la API y actualiza el estado.
   */
  private executeToggleFollow(): void {
    this.isLoading = true;
    const previousState = this.entity.isFollowing;
    
    // Actualización optimista
    this.entity.isFollowing = !this.entity.isFollowing;

    // Llamada al servicio genérico
    this.followService.toggleFollow(this.type, this.entity.id).subscribe({
      next: () => {
        this.followStateChanged.emit(this.entity.isFollowing);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(`Error al seguir/dejar de seguir ${this.type}`, err);
        // Revertimos el cambio
        this.entity.isFollowing = previousState;
        this.isLoading = false;
      }
    });
  }
}