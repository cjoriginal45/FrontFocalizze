import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Page } from '../../interfaces/PageInterface';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';

@Injectable({
  providedIn: 'root',
})
export class FeedService {
  private http = inject(HttpClient);
  // Construimos la URL base de nuestro endpoint del feed
  private apiUrl = `${environment.apiBaseUrl}/feed`;

  /**
   * Obtiene una página de hilos del feed desde el backend.
   * @param page El número de página a solicitar (empezando en 0).
   * @param size El número de hilos por página.
   * @returns Un Observable con la respuesta paginada.
   */
  getFeed(page: number, size: number): Observable<Page<ThreadResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<Page<ThreadResponse>>(this.apiUrl, { params });
  }

}
