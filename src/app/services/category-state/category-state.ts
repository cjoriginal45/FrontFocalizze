import { Injectable, signal, WritableSignal } from '@angular/core';
import { CategoryInterface } from '../../interfaces/CategoryInterface';

@Injectable({
  providedIn: 'root',
})
export class CategoryState {
  private categoryMap = new Map<number, WritableSignal<CategoryInterface>>(); // Clave: categoryId

  constructor() {}

  loadCategories(categories: CategoryInterface[]): void {
    categories.forEach((categoryFromApi) => {
      const existingSignal = this.categoryMap.get(categoryFromApi.id);
      if (existingSignal) {
        // Si ya existe, simplemente actualiza su valor con los nuevos datos de la API.
        existingSignal.set(categoryFromApi);
      } else {
        // Si no existe, crea la señal.
        this.categoryMap.set(categoryFromApi.id, signal(categoryFromApi));
      }
    });
  }

  getCategorySignal(id: number): WritableSignal<CategoryInterface> | undefined {
    return this.categoryMap.get(id);
  }

  updateFollowingState(id: number, isFollowing: boolean): void {
    const categorySignal = this.categoryMap.get(id);
    if (categorySignal) {
      categorySignal.update((category) => ({
        ...category,
        isFollowedByCurrentUser: isFollowing, // Actualiza el booleano
        followersCount: category.followerCount + (isFollowing ? 1 : -1), // Actualiza el contador
      }));
      console.log(
        `[CategoryState] Estado de seguimiento para categoría ${id} actualizado a ${isFollowing}`
      );
    }
  }

  clearState(): void {
    this.categoryMap.clear();
    console.log('[CategoryState] Estado limpiado.');
  }
}
