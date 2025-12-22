import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserSearch } from '../../interfaces/UserSearch';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';
import { FeedThreadDto } from '../../interfaces/FeedThread';

@Injectable({
  providedIn: 'root',
})
export class Search {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  searchUsers(query: string): Observable<UserSearch[]> {
    // Lógica para buscar usuarios en la API
    // Logic to search users in the API
    const fullUrl = `${this.apiUrl}/search/users?q=${encodeURIComponent(query)}`;
    return this.http.get<UserSearch[]>(fullUrl);
  }

  searchContent(query: string): Observable<ThreadResponse[]> {
    const fullUrl = `${this.apiUrl}/search/content?q=${encodeURIComponent(query)}`;
    return this.http.get<ThreadResponse[]>(fullUrl);
  }
}
