import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowButtonService {
  private usersApiUrl = '/api/users';
  private categoriesApiUrl = '/api/categories';

  constructor(private http: HttpClient) { }
  

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
