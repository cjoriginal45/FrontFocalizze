import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { Header } from "../../../../components/header/header"; 

interface UserProfile {
  username: string;
  avatarUrl: string;
  biography: string;
}

@Component({
  selector: 'app-count-profile',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    Header
],
  templateUrl: './count-profile.html',
  styleUrl: './count-profile.css',
})
export class CountProfile {
// Datos de usuario harcodeados para la demostración visual.
  // Más adelante, estos datos vendrán de un servicio.
  user: UserProfile = {
    username: 'pablo21',
    avatarUrl: 'https://mockmind-api.uifaces.co/content/human/104.jpg', // URL de un avatar similar al del diseño
    biography: `Lorem, ipsum dolor sit amet consectetur adipisicing elit. Blanditiis, libero. Atque, commodi facere voluptas quaerat at doloremque quos quis, omnis nemo id unde tempora quidem esse voluptatum mollitia ut. Praesentium.`,
  };


  constructor() {
    // La lógica de obtención de datos del usuario iría aquí en el futuro.
  }
}
