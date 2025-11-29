import { effect, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  // Usamos una señal para reactividad instantánea
  public currentTheme = signal<ThemeMode>('light');

  constructor() {
    this.loadTheme();

    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      localStorage.setItem('user-theme', theme);
    });
  }

  private loadTheme() {
    const storedTheme = localStorage.getItem('user-theme') as ThemeMode;

    if (storedTheme) {
      this.currentTheme.set(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }
  }

  // Actualizamos la firma del método
  private applyTheme(theme: ThemeMode) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  // Actualizamos la firma del método
  setTheme(theme: ThemeMode) {
    this.currentTheme.set(theme);
  }
}
