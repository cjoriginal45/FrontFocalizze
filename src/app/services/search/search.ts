import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserSearch } from '../../interfaces/UserSearch';

@Injectable({
  providedIn: 'root'
})
export class Search {
  
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  searchUsers(query: string): Observable<UserSearch[]> {
    // Lógica para buscar usuarios en la API
    // Logic to search users in the API
    const fullUrl = `${this.apiUrl}/search/users?q=${encodeURIComponent(query)}`;
    console.log('CONSTRUYENDO PETICIÓN GET A (relativa):', fullUrl);
    return this.http.get<UserSearch[]>(fullUrl);
  }
}
