import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryInterface } from '../../interfaces/CategoryInterface';

@Injectable({
  providedIn: 'root'
})
export class Category {
  private apiUrl = environment.apiBaseUrl+'/categories';

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<CategoryInterface[]> {
    return this.http.get<CategoryInterface[]>(this.apiUrl);
  }
}
