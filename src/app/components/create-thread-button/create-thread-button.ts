import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThreadModal } from '../../services/threadModal/thread-modal';
import { Auth } from '../../services/auth/auth';

/**
 * Botón flotante para la creación de hilos.
 * Solo se renderiza si el usuario tiene una sesión activa.
 */
@Component({
  selector: 'app-create-thread-button',
  standalone: true,
  imports: [ 
    MatButtonModule,
    MatIconModule],
  templateUrl: './create-thread-button.html',
  styleUrl: './create-thread-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateThreadButton {
   // Inyección de servicios moderna y segura (readonly)
   private readonly modalService = inject(ThreadModal);
   public readonly authService = inject(Auth);

 
  /**
   * Abre el modal para crear un nuevo hilo mediante el servicio.
   */
  public createThread(): void {
    this.modalService.openCreateThreadModal();
  }
}
