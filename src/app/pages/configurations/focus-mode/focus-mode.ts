import { Component, inject } from '@angular/core';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../../../components/header/header';
import { BottonNav } from '../../../components/botton-nav/botton-nav';

@Component({
  selector: 'app-focus-mode',
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSlideToggleModule, Header, BottonNav],
  templateUrl: './focus-mode.html',
  styleUrl: './focus-mode.css',
})
export class FocusMode {
  private location = inject(AngularLocation);

  // Estado inicial (en la imagen parece estar activado)
  isFocusModeEnabled = true;

  goBack(): void {
    this.location.back();
  }

  toggleFocusMode(): void {
    this.isFocusModeEnabled = !this.isFocusModeEnabled;
    console.log('Modo enfoque:', this.isFocusModeEnabled ? 'Activado' : 'Desactivado');
    // Aquí llamarías a tu servicio backend para guardar la configuración
  }
}
