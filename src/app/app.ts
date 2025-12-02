import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './services/themeService/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Focalizze');

  // Solo con inyectarlo, el constructor del servicio se ejecuta y aplica el tema
  private themeService = inject(Theme);
}
