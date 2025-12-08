import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

export type ThemeMode = 'light' | 'dark';
export type BackgroundType = 'default' | 'color' | 'image';

export interface ThemeConfig {
  mode: ThemeMode;
  bgType: BackgroundType;
  bgValue: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Theme {
  // Usamos una señal para reactividad instantánea
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/users/me/theme`;

  // Señales para el estado
  public currentTheme = signal<ThemeMode>('light');
  public backgroundType = signal<BackgroundType>('default');
  public backgroundValue = signal<string | null>(null);

  constructor() {
    this.loadFromStorage();

    // Efecto: Aplica los cambios al DOM cada vez que cambian las señales
    effect(() => {
      this.applyThemeToDOM();
      this.saveToStorage();
    });
  }

  // --- LÓGICA DE APLICACIÓN AL DOM ---
  private applyThemeToDOM() {
    const mode = this.currentTheme();
    const type = this.backgroundType();
    const value = this.backgroundValue();
    const body = document.body;

    // 1. Aplicar clase Dark/Light
    if (mode === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }

    // 2. Aplicar Fondo Personalizado
    if (type === 'color' && value) {
      body.style.setProperty('--background-color', value);
      body.style.backgroundImage = 'none';
    } else if (type === 'image' && value) {
      // Configuramos para que la imagen cubra todo y sea fija
      body.style.backgroundImage = `url(${value})`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundPosition = 'center';
      body.style.backgroundAttachment = 'fixed';
      // Un fallback de color por si la imagen tarda
      body.style.setProperty('--background-color', mode === 'dark' ? '#121212' : '#fdfdfd');
    } else {
      // Default: Limpiamos estilos inline para que el CSS global tome el control
      body.style.removeProperty('--background-color');
      body.style.backgroundImage = 'none';
    }
  }

  // --- SETTERS (Actualizan señal + Backend) ---

  setThemeMode(mode: ThemeMode) {
    this.currentTheme.set(mode);
    // Nota: El modo light/dark suele guardarse separado o junto,
    // aquí asumimos que solo persistimos el "fondo" en el endpoint nuevo,
    // pero idealmente deberías guardar todo.
  }

  setCustomBackground(type: BackgroundType, value: string | null) {
    this.backgroundType.set(type);
    this.backgroundValue.set(value);

    // Persistir en Backend (Fire and forget)
    this.http
      .patch(this.apiUrl, {
        backgroundType: type,
        backgroundValue: value,
      })
      .subscribe({
        error: (err) => console.error('Error guardando tema', err),
      });
  }

  // --- STORAGE LOCAL ---
  private saveToStorage() {
    const config: ThemeConfig = {
      mode: this.currentTheme(),
      bgType: this.backgroundType(),
      bgValue: this.backgroundValue(),
    };
    localStorage.setItem('user-theme-config', JSON.stringify(config));
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('user-theme-config');
    if (stored) {
      const config = JSON.parse(stored) as ThemeConfig;
      this.currentTheme.set(config.mode);
      this.backgroundType.set(config.bgType);
      this.backgroundValue.set(config.bgValue);
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }
  }

  // Método para sincronizar con datos que vienen del Login/UserDto
  syncWithUserDto(dtoType: string, dtoValue: string) {
    if (dtoType) this.backgroundType.set(dtoType as BackgroundType);
    if (dtoValue) this.backgroundValue.set(dtoValue);
  }
}
