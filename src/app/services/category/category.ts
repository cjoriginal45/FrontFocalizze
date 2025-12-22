import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryInterface } from '../../interfaces/CategoryInterface';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { CategoryDetailsInterface } from '../../interfaces/CategoryDetailsInterface';
import { Page } from '../../interfaces/PageInterface';

@Injectable({
  providedIn: 'root',
})
export class Category {
  private apiUrl = environment.apiBaseUrl + '/categories';

  constructor(private http: HttpClient) {}

  getAllCategories(): Observable<CategoryInterface[]> {
    return this.http.get<CategoryInterface[]>(this.apiUrl);
  }

  getCategoryDetails(name: string): Observable<CategoryDetailsInterface> {
    return this.http.get<CategoryDetailsInterface>(`${this.apiUrl}/${name}`);
  }

  getThreadsForCategory(name: string, page: number, size: number): Observable<Page<FeedThreadDto>> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<Page<FeedThreadDto>>(`${this.apiUrl}/${name}/threads`, { params });
  }
}
