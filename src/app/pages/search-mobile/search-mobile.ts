import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SearchHistory } from '../../services/searchHistory/search-history';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SearchBar } from '../../components/search-bar/search-bar';
import { BottonNav } from '../../components/botton-nav/botton-nav';

@Component({
  selector: 'app-search-mobile',
  imports: [CommonModule, MatIconModule, MatButtonModule, SearchBar, BottonNav],
  templateUrl: './search-mobile.html',
  styleUrl: './search-mobile.css',
})
export class SearchMobile implements OnInit {
  private location = inject(Location);
  private searchHistoryService = inject(SearchHistory);

  // Apuntamos al componente hijo SearchBar para poder interactuar con él
  @ViewChild(SearchBar) searchBar!: SearchBar;

  searchHistory: string[] = [];

  ngOnInit(): void {
    this.searchHistory = this.searchHistoryService.getHistory();
  }

  onHistoryClick(term: string): void {
    // Le decimos al componente de búsqueda que actualice su valor y ejecute la búsqueda
    this.searchBar.searchControl.setValue(term);
    this.searchBar.onSearchSubmit();
  }

  goBack(): void {
    this.location.back();
  }
}
