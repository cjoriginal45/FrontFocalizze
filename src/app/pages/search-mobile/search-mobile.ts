import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { SearchHistory, SearchHistoryItem } from '../../services/searchHistory/search-history';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SearchBar } from '../../components/search-bar/search-bar';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Router } from '@angular/router';
import { ThreadState } from '../../services/thread-state/thread-state';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search-mobile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, SearchBar, BottonNav, TranslateModule],
  templateUrl: './search-mobile.html',
  styleUrl: './search-mobile.css',
})
export class SearchMobile implements OnInit {
  private location = inject(Location);
  private searchHistoryService = inject(SearchHistory);
  private router = inject(Router);
  private threadStateService = inject(ThreadState);

  threadIds: number[] = [];
  // Apuntamos al componente hijo SearchBar para poder interactuar con él
  @ViewChild(SearchBar) searchBar!: SearchBar;

  // --- CAMBIO de tipo ---
  searchHistory: SearchHistoryItem[] = [];

  ngOnInit(): void {
    this.searchHistory = this.searchHistoryService.getHistory();
    this.threadStateService.threadDeleted$.subscribe(deletedThreadId => {
      console.log(`[FeedComponent] Recibida notificación para eliminar el hilo ID: ${deletedThreadId}`);
      // Eliminamos el ID de nuestra lista local para que deje de renderizarse.
      this.threadIds = this.threadIds.filter(id => id !== deletedThreadId);
    });
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
