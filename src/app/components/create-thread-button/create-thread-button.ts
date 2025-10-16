import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-thread-button',
  imports: [ 
     MatButtonModule,
    MatIconModule],
  templateUrl: './create-thread-button.html',
  styleUrl: './create-thread-button.css'
})
export class CreateThreadButton {
  constructor() { }

  createThread(): void {
    // Aquí es donde, en el futuro, llamarías a un servicio para abrir la modal de creación de hilo.
    // This is where, in the future, you would call a service to open the thread creation modal.
    console.log('Abrir modal para crear hilo...');
  }
}
