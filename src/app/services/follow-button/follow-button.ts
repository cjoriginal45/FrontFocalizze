import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FollowButtonService {
  private usersApiUrl = environment.apiBaseUrl + '/users';
  private categoriesApiUrl = environment.apiBaseUrl + '/categories';

  constructor(private http: HttpClient) {}

  // Alterna el estado de seguimiento para un usuario o una categoría
  toggleFollow(type: 'user' | 'category', id: number | string): Observable<void> {
    let url = '';
    if (type === 'user') {
      url = `${this.usersApiUrl}/${id}/follow`;
    } else {
      url = `${this.categoriesApiUrl}/${id}/follow`;
    }
    return this.http.post<void>(url, {});
  }
}
