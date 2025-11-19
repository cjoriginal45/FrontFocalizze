import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { CategoryInterface } from '../../interfaces/CategoryInterface';
import { Category } from '../../services/category/category';
import { CategoryState } from '../../services/category-state/category-state';
import { SuggestionItem } from '../suggestion-item/suggestion-item/suggestion-item';

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, SuggestionItem],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.css',
  // --- ELIMINAMOS EL BLOQUE DE 'animations' POR COMPLETO ---
})
export class Suggestions implements OnInit {
  private categoryStateService = inject(CategoryState);
  private categoryService = inject(Category);

  isMobilePanelOpen = false;
  showAllCategories = false;

  // --- La lógica de Signals se mantiene exactamente igual ---
  private allCategoryIds = signal<number[]>([]);

  public sortedCategoryIds: Signal<number[]> = computed(() => {
    const ids = this.allCategoryIds();
    if (ids.length === 0) return []; // Guarda de seguridad

    const categoriesData = ids
      .map((id) => this.categoryStateService.getCategorySignal(id)?.())
      .filter(Boolean) as CategoryInterface[];
    if (categoriesData.length !== ids.length) return ids; // Si los datos no están listos, devolvemos sin ordenar

    return categoriesData
      .sort((a, b) => {
        if (a.isFollowedByCurrentUser === b.isFollowedByCurrentUser) {
          return a.name.localeCompare(b.name);
        }
        return a.isFollowedByCurrentUser ? 1 : -1;
      })
      .map((c) => c.id);
  });

  public suggestedCategoryIds: Signal<number[]> = computed(() => {
    return this.sortedCategoryIds().slice(0, 3);
  });

  constructor() {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        const validCategories = categories.filter((cat) => cat.name !== 'Ninguna');
        this.categoryStateService.loadCategories(validCategories);
        this.allCategoryIds.set(validCategories.map((c) => c.id));
      },
      error: (err) => console.error('Error al cargar las categorías de sugerencias', err),
    });
  }

  toggleShowAllCategories(): void {
    this.showAllCategories = !this.showAllCategories;
  }

  toggleMobilePanel(): void {
    this.isMobilePanelOpen = !this.isMobilePanelOpen;
  }
}
