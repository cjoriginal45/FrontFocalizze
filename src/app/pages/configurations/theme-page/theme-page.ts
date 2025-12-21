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
    '#EF9A9A', // Rojo suave
    '#F48FB1', // Rosa
    '#CE93D8', // Lila
    '#B39DDB', // Lavanda profundo
    '#9FA8DA', // Índigo suave
    '#90CAF9', // Azul cielo
    '#80CBC4', // Teal / Menta
    '#A5D6A7', // Verde hoja
    '#FFF59D', // Amarillo crema
    '#FFCC80', // Naranja / Durazno
    '#BCAAA4', // Marrón tierra suave
    '#B0BEC5', // Gris azulado
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
