import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface SuggestedCategory {
  icon: string; // Nombre del icono de Material Icons
  name: string;
}

@Component({
  selector: 'app-suggestions',
  imports: [MatIconModule, RouterLink],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.css'
})
export class Suggestions {
  // Variable para controlar la visibilidad del panel en móvil
  isMobilePanelOpen = false;

  // Datos de ejemplo para las categorías sugeridas
  suggestedCategories: SuggestedCategory[] = [
    { icon: 'code', name: 'Desarrollo Web' },
    { icon: 'draw', name: 'Diseño UX/UI' },
    { icon: 'rocket_launch', name: 'Startups' }
  ];

  constructor() {}

  /**
   * Cambia el estado de visibilidad del panel móvil.
   */
  toggleMobilePanel(): void {
    this.isMobilePanelOpen = !this.isMobilePanelOpen;
  }
}
