import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CategoryInterface } from '../../interfaces/CategoryInterface';
import { Category } from '../../services/category/category';
import { FollowButton } from "../follow-button/follow-button/follow-button";
import { CategoryState } from '../../services/category-state/category-state';
import { SuggestionItem } from "../suggestion-item/suggestion-item/suggestion-item";

interface SuggestedCategory {
  icon: string; // Nombre del icono de Material Icons
  name: string;
}


@Component({
  selector: 'app-suggestions',
  imports: [MatIconModule, RouterLink, CommonModule, FollowButton, SuggestionItem],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.css'
})
export class Suggestions implements OnInit{
  // Variable para controlar la visibilidad del panel en móvil
  // Visibility of the mobile panel
  isMobilePanelOpen = false;

  // Lógica para las categorías
  // Logic for categories
  allCategoryIds: number[] = [];
  suggestedCategoryIds: number[] = [];
  showAllCategories = false; 


  private categoryStateService = inject(CategoryState);
  private categoryService = inject(Category);

  constructor() {}

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
        const validCategories = categories.filter(cat => cat.name !== "Ninguna");

        // CARGAMOS LAS CATEGORÍAS EN EL NUEVO STORE
        this.categoryStateService.loadCategories(validCategories);
        
        this.allCategoryIds = validCategories.map(c => c.id);
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
    const shuffled = [...this.allCategoryIds].sort(() => 0.5 - Math.random());
    this.suggestedCategoryIds = shuffled.slice(0, 3);
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
