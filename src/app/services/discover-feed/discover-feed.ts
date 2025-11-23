import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Page } from '../../interfaces/PageInterface';
import { DiscoverItemDto } from '../../interfaces/DiscoverItemDto';

@Injectable({
  providedIn: 'root',
})
export class DiscoverFeed {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/feed/discover`;

  getDiscoverFeed(page: number, size: number): Observable<Page<DiscoverItemDto>> {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));

    return this.http.get<Page<DiscoverItemDto>>(this.apiUrl, { params });
  }

  // Método para enviar feedback negativo
  hideThread(threadId: number, reasonType: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiBaseUrl}/feed/feedback/hide`,
      {},
      {
        params: { threadId, reasonType },
      }
    );
  }
}
