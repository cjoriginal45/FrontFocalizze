import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchHistory {
  private readonly STORAGE_KEY = 'focalizze_search_history';
  private readonly MAX_HISTORY_ITEMS = 7;

  getHistory(): string[] {
    const historyJson = localStorage.getItem(this.STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  }

  addSearchTerm(term: string): void {
    if (!term || term.trim() === '') return;
    let history = this.getHistory().filter((item) => item.toLowerCase() !== term.toLowerCase());
    history.unshift(term);
    if (history.length > this.MAX_HISTORY_ITEMS) {
      history = history.slice(0, this.MAX_HISTORY_ITEMS);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }
}
