import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CategoryInterface } from '../../interfaces/CategoryInterface';
import { Category } from '../../services/category/category';
import { CategoryState } from '../../services/category-state/category-state';
import { SuggestionItem } from '../suggestion-item/suggestion-item/suggestion-item';
import { trigger, state, style, transition, animate } from '@angular/animations'; // <-- AÑADIR para la animación

@Component({
  selector: 'app-suggestions',
  standalone: true, // <-- AÑADIR standalone y los imports
  imports: [MatIconModule, RouterLink, CommonModule, SuggestionItem, CommonModule],
  templateUrl: './suggestions.html',
  styleUrl: './suggestions.css',
  animations: [
    // <-- AÑADIR bloque de animación
    trigger('slideFade', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [animate('250ms ease-in', style({ height: 0, opacity: 0 }))]),
    ]),
  ],
})
export class Suggestions implements OnInit {
  private categoryStateService = inject(CategoryState);
  private categoryService = inject(Category);

  isMobilePanelOpen = false;
  showAllCategories = false;

  // --- ARQUITECTURA DE SIGNALS ---

  // 1. Guardamos la lista completa de IDs
  private allCategoryIds = signal<number[]>([]);

  // 2. Creamos una señal COMPUTADA que ordena automáticamente la lista
  public sortedCategoryIds: Signal<number[]> = computed(() => {
    const ids = this.allCategoryIds();
    // Obtenemos los datos de las señales para poder ordenar
    const categoriesData = ids.map((id) => this.categoryStateService.getCategorySignal(id)!());

    return categoriesData
      .sort((a, b) => {
        // Si el estado de seguimiento es el mismo (ambos seguidos o no seguidos), ordena alfabéticamente.
        if (a.isFollowedByCurrentUser === b.isFollowedByCurrentUser) {
          return a.name.localeCompare(b.name);
        }
        // Si 'a' no está seguido y 'b' sí, 'a' va primero (devuelve -1).
        // Si 'a' está seguido y 'b' no, 'b' va primero (devuelve 1).
        return a.isFollowedByCurrentUser ? 1 : -1;
      })
      .map((c) => c.id); // Devolvemos solo los IDs ya ordenados
  });

  // 3. La lista de sugerencias ahora también es una señal computada
  public suggestedCategoryIds: Signal<number[]> = computed(() => {
    // Tomamos las 3 primeras categorías de la lista ya ordenada (que serán las no seguidas)
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

        // Actualizamos la señal con los IDs
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
