import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThreadModal } from '../../services/threadModal/thread-modal';

@Component({
  selector: 'app-create-thread-button',
  imports: [ 
     MatButtonModule,
    MatIconModule],
  templateUrl: './create-thread-button.html',
  styleUrl: './create-thread-button.css'
})
export class CreateThreadButton {
   
  constructor(private modalService: ThreadModal) { }

  createThread(): void {
    // Llamamos al servicio para abrir la modal
    this.modalService.openCreateThreadModal();
  }
}
