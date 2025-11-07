import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Search } from '../../services/search/search';
import { SearchHistory } from '../../services/searchHistory/search-history';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { UserSearch } from '../../interfaces/UserSearch';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private router = inject(Router);
  private searchService = inject(Search);
  private searchHistoryService = inject(SearchHistory);

  searchControl = new FormControl('');
  userSearchResults$!: Observable<UserSearch[]>;

  ngOnInit(): void {
    this.userSearchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        const query = value || '';
        if (query.startsWith('@') && query.length > 1) {
          return this.searchService.searchUsers(query.substring(1)); // Buscamos sin el @
        }
        return of([]);
      })
    );
  }

  onSearchSubmit(): void {
    const query = this.searchControl.value?.trim() || '';
    if (query && !query.startsWith('@')) {
      this.searchHistoryService.addSearchTerm(query);
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const username = event.option.value;
    this.router.navigate(['/profile', username]);
    this.searchControl.setValue('');
  }

  displayUser(user: UserSearch): string {
    return user ? `@${user.username}` : '';
  }
}
