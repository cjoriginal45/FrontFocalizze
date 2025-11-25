import { Component, inject } from '@angular/core';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { Header } from '../../../components/header/header';

@Component({
  selector: 'app-theme-page',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule, // Para el efecto de click
    Header,
    BottonNav,
  ],
  templateUrl: './theme-page.html',
  styleUrl: './theme-page.css',
})
export class ThemePage {
  private location = inject(AngularLocation);

  // 'light' o 'dark'. Podrías cargar esto de un servicio al iniciar.
  selectedTheme: string = 'light';

  goBack(): void {
    this.location.back();
  }

  setTheme(theme: string): void {
    this.selectedTheme = theme;
    console.log('Tema cambiado a:', theme);
    // Aquí llamarías a tu ThemeService para aplicar los cambios globales
  }
}
