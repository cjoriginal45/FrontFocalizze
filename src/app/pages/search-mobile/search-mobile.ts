import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SearchHistory, SearchHistoryItem } from '../../services/searchHistory/search-history';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SearchBar } from '../../components/search-bar/search-bar';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-mobile',
  imports: [CommonModule, MatIconModule, MatButtonModule, SearchBar, BottonNav],
  templateUrl: './search-mobile.html',
  styleUrl: './search-mobile.css',
})
export class SearchMobile implements OnInit {
  private location = inject(Location);
  private searchHistoryService = inject(SearchHistory);
  private router = inject(Router);

  // Apuntamos al componente hijo SearchBar para poder interactuar con él
  @ViewChild(SearchBar) searchBar!: SearchBar;

  // --- CAMBIO de tipo ---
  searchHistory: SearchHistoryItem[] = [];

  ngOnInit(): void {
    this.searchHistory = this.searchHistoryService.getHistory();
  }

  onHistoryClick(item: SearchHistoryItem): void {
    // Determinamos qué hacer según el tipo de item
    if (item.type === 'content') {
      this.searchBar.searchControl.setValue(item.query);
      this.searchBar.onSearchSubmit();
    } else if (item.type === 'user') {
      // Navegamos directamente al perfil del usuario
      this.router.navigate(['/profile', item.user.username]);
    }
  }

  // --- NUEVO MÉTODO ---
  onRemoveHistoryItem(id: number, event: MouseEvent): void {
    event.stopPropagation(); // Evita que el clic en el botón active el onHistoryClick
    this.searchHistoryService.removeHistoryItem(id);
    // Actualizamos la lista en la UI al instante
    this.searchHistory = this.searchHistory.filter((item) => item.id !== id);
  }

  goBack(): void {
    this.location.back();
  }
}
