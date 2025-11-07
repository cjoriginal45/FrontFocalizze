import { Injectable } from '@angular/core';
import { UserSearch } from '../../interfaces/UserSearch';

export type SearchHistoryItem =
  | {
      id: number;
      type: 'content';
      query: string;
    }
  | {
      id: number;
      type: 'user';
      user: UserSearch;
    };

@Injectable({
  providedIn: 'root',
})
export class SearchHistory {
  private readonly STORAGE_KEY = 'focalizze_search_history';
  private readonly MAX_HISTORY_ITEMS = 7;

  getHistory(): SearchHistoryItem[] {
    const historyJson = localStorage.getItem(this.STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  }

  // --- MÉTODO MODIFICADO ---
  addContentSearch(term: string): void {
    if (!term || term.trim() === '') return;

    let history = this.getHistory().filter(
      (item) => !(item.type === 'content' && item.query.toLowerCase() === term.toLowerCase())
    );

    history.unshift({ id: Date.now(), type: 'content', query: term });
    this.saveHistory(history);
  }

  // --- NUEVO MÉTODO ---
  addUserSearch(user: UserSearch): void {
    if (!user) return;

    let history = this.getHistory().filter(
      (item) => !(item.type === 'user' && item.user.username === user.username)
    );

    history.unshift({ id: Date.now(), type: 'user', user: user });
    this.saveHistory(history);
  }

  // --- NUEVO MÉTODO ---
  removeHistoryItem(id: number): void {
    let history = this.getHistory().filter((item) => item.id !== id);
    this.saveHistory(history);
  }

  // --- NUEVO MÉTODO PRIVADO para evitar duplicar código ---
  private saveHistory(history: SearchHistoryItem[]): void {
    if (history.length > this.MAX_HISTORY_ITEMS) {
      history = history.slice(0, this.MAX_HISTORY_ITEMS);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }
}
