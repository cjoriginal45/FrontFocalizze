import { Component, inject } from '@angular/core';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { Header } from '../../../components/header/header';
import { BackgroundType, Theme, ThemeMode } from '../../../services/themeService/theme';

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
  public themeService = inject(Theme);

  // Datos para la UI
  presetColors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#009688',
    '#4CAF50',
    '#FFC107',
    '#FF5722',
    '#795548',
    '#607D8B',
  ];

  // Asegúrate de tener estas imágenes en tu carpeta assets
  wallpapers = [
    'assets/images/wallpapers/bg-1.jpg',
    'assets/images/wallpapers/bg-2.jpg',
    'assets/images/wallpapers/bg-3.jpg',
    'assets/images/wallpapers/bg-4.jpg',
  ];

  // Getters para usar en el HTML de forma limpia
  get selectedTheme(): ThemeMode {
    return this.themeService.currentTheme();
  }

  get currentBgType(): BackgroundType {
    return this.themeService.backgroundType();
  }

  get currentBgValue(): string | null {
    return this.themeService.backgroundValue();
  }

  goBack(): void {
    this.location.back();
  }

  setThemeMode(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
  }

  // --- MÉTODOS DE PERSONALIZACIÓN ---

  resetBackground() {
    this.themeService.setCustomBackground('default', null);
  }

  selectColor(color: string) {
    this.themeService.setCustomBackground('color', color);
  }

  onColorPickerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.themeService.setCustomBackground('color', input.value);
  }

  selectWallpaper(url: string) {
    this.themeService.setCustomBackground('image', url);
  }
}
