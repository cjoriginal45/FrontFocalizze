import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Page } from '../../interfaces/PageInterface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class savedThreadsService {
  private apiUrl = environment.apiBaseUrl + '/threads/saved';

  constructor(private http: HttpClient) { }

  getSavedThreads(page: number, size: number): Observable<Page<FeedThreadDto>> {
  const params = new HttpParams()
  .set('page', page.toString())
  .set('size', size.toString());

  return this.http.get<Page<FeedThreadDto>>(this.apiUrl, { params });

  }

}
