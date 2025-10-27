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
  // Visibility of the mobile panel
  isMobilePanelOpen = false;

  // Lógica para las categorías
  // Logic for categories
  protected allCategories: CategoryInterface[] = [];
  suggestedCategories: CategoryInterface[] = []; 
  showAllCategories = false; 

  constructor(private categoryService: Category) {}

  // ngOnInit se ejecuta cuando el componente se inicializa
  // ngOnInit is executed when the component is initialized
  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Selecciona 3 categorías aleatorias de la lista completa.
   * Selects 3 random categories from the full list.
   */
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        // Excluimos la categoría "Ninguna"
        this.allCategories = categories.filter(cat => cat.name !== "Ninguna");
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
   * Selects 3 random categories from the full list.
   */
   selectRandomSuggestions(): void {
    // Barajamos una copia del array para no modificar el original
    const shuffled = [...this.allCategories].sort(() => 0.5 - Math.random());
    // Tomamos las primeras 3
    this.suggestedCategories = shuffled.slice(0, 3);
  }

  /**
   * Cambia el estado para mostrar/ocultar la lista completa de categorías.
   * Toggles the state to show/hide the full list of categories.
   */
  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  /**
   * Cambia el estado de visibilidad del panel móvil.
   * Toggles the visibility state of the mobile panel.
   */
  toggleMobilePanel(): void {
    this.isMobilePanelOpen = !this.isMobilePanelOpen;
  }
}
