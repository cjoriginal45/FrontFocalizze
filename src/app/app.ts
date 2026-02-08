import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './services/themeService/theme';
import { Auth } from './services/auth/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('Focalizze');

  // Solo con inyectarlo, el constructor del servicio se ejecuta y aplica el tema
  private themeService = inject(Theme);

  private authService = inject(Auth); // Inyectamos el servicio

  ngOnInit() {
    //eliminar
    console.log('AppComponent inicializado, llamando a loadUserFromToken...');
    this.authService.loadUserFromToken(); 
  }
}
