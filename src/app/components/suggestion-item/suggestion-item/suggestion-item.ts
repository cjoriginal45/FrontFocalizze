import { Component, inject, Input, OnInit, WritableSignal } from '@angular/core';
import { CategoryState } from '../../../services/category-state/category-state';
import el from '@angular/common/locales/el';
import se from '@angular/common/locales/se';
import { CategoryInterface } from '../../../interfaces/CategoryInterface';
import { MatIcon } from "@angular/material/icon";
import { FollowButton } from "../../follow-button/follow-button/follow-button";

@Component({
  selector: 'app-suggestion-item',
  imports: [MatIcon, FollowButton],
  templateUrl: './suggestion-item.html',
  styleUrl: './suggestion-item.css'
})
export class SuggestionItem implements OnInit {
  // --- Inyección de Dependencias ---
  private categoryStateService = inject(CategoryState);
  // --- Input ---
  @Input({ required: true }) categoryId!: number;
  // --- Señal de Datos ---
  public categorySignal: WritableSignal<CategoryInterface> | undefined;
  ngOnInit(): void {
  // Obtenemos la señal de la categoría desde el store usando el ID.
  this.categorySignal = this.categoryStateService.getCategorySignal(this.categoryId);
  if (!this.categorySignal) {
    console.error(`Error: No se encontró la señal para la categoría con ID ${this.categoryId}.`);
  }
  }
}
