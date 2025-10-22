import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThreadModal } from '../../services/threadModal/thread-modal';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-create-thread-button',
  imports: [ 
     MatButtonModule,
    MatIconModule],
  templateUrl: './create-thread-button.html',
  styleUrl: './create-thread-button.css'
})
export class CreateThreadButton {

  private modalService = inject(ThreadModal);
  public authService = inject(Auth);
   
  constructor() { }

  createThread(): void {
    // Llamamos al servicio para abrir la modal
    this.modalService.openCreateThreadModal();
  }
}
