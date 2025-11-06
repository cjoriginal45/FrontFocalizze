import { Injectable, signal, WritableSignal } from '@angular/core';
import { CategoryInterface } from '../../interfaces/CategoryInterface';

@Injectable({
  providedIn: 'root'
})
export class CategoryState {
  private categoryMap = new Map<number, WritableSignal<CategoryInterface>>(); // Clave: categoryId

  constructor() {}

  loadCategories(categories: CategoryInterface[]): void {
    categories.forEach(category => {
      if (!this.categoryMap.has(category.id)) {
        this.categoryMap.set(category.id, signal(category));
      } else {
        // Actualiza preservando el estado de seguimiento
        this.categoryMap.get(category.id)!.update(currentCat => ({
          ...category,
          isFollowedByCurrentUser: currentCat.isFollowedByCurrentUser
        }));
      }
    });
  }

  getCategorySignal(id: number): WritableSignal<CategoryInterface> | undefined {
    return this.categoryMap.get(id);
  }

  updateFollowingState(id: number, isFollowing: boolean): void {
    const categorySignal = this.categoryMap.get(id);
    if (categorySignal) {
      categorySignal.update(category => ({
        ...category,
        isFollowedByCurrentUser: isFollowing, // Actualiza el booleano
        followersCount: category.followerCount + (isFollowing ? 1 : -1) // Actualiza el contador
      }));
      console.log(`[CategoryState] Estado de seguimiento para categoría ${id} actualizado a ${isFollowing}`);
    }
  }
}
