import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CategoryInterface } from '../../interfaces/CategoryInterface';
import { Category } from '../../services/category/category';

interface SuggestedCategory {
  icon: string; // Nombre del icono de Material Icons
  name: string;
}

@Component({
  selector: 'app-suggestions',
  imports: [MatIconModule, RouterLink,CommonModule],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.css'
})
export class Suggestions implements OnInit{
  // Variable para controlar la visibilidad del panel en móvil
  isMobilePanelOpen = false;

  // Lógica para las categorías
  protected allCategories: CategoryInterface[] = []; // Almacena todas las categorías de la API
  suggestedCategories: CategoryInterface[] = []; // Las 3 categorías aleatorias que se muestran
  showAllCategories = false; // Controla la visibilidad de la lista completa

  constructor(private categoryService: Category) {}

  // ngOnInit se ejecuta cuando el componente se inicializa
  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Selecciona 3 categorías aleatorias de la lista completa.
   */
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        // Al cargar, seleccionamos 3 categorías aleatorias para mostrar
        this.selectRandomSuggestions();
      },
      error: (err) => {
        console.error('Error al cargar las categorías de sugerencias', err);
      }
    });
  }

   /**
   * Selecciona 3 categorías aleatorias de la lista completa.
   */
   selectRandomSuggestions(): void {
    // Barajamos una copia del array para no modificar el original
    const shuffled = [...this.allCategories].sort(() => 0.5 - Math.random());
    // Tomamos las primeras 3
    this.suggestedCategories = shuffled.slice(0, 3);
  }

  /**
   * Cambia el estado para mostrar/ocultar la lista completa de categorías.
   */
  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  /**
   * Cambia el estado de visibilidad del panel móvil.
   */
  toggleMobilePanel(): void {
    this.isMobilePanelOpen = !this.isMobilePanelOpen;
  }
}
