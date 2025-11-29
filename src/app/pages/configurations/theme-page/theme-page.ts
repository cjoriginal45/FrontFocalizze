import { Component, inject } from '@angular/core';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { Header } from '../../../components/header/header';
import { Theme, ThemeMode } from '../../../services/themeService/theme';

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

  // Inyectamos el servicio (que se llama Theme)
  public themeService = inject(Theme);

  // Usamos el tipo 'ThemeMode'
  get selectedTheme(): ThemeMode {
    return this.themeService.currentTheme();
  }

  goBack(): void {
    this.location.back();
  }

  // Usamos el tipo 'ThemeMode'
  setTheme(theme: ThemeMode): void {
    this.themeService.setTheme(theme);
  }
}
