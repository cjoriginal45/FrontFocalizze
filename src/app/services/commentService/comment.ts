import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Page } from '../../interfaces/PageInterface';
import { CommentResponseDto } from '../../interfaces/CommentResponse';

@Injectable({
  providedIn: 'root',
})
export class Comment{
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/threads`;

  getComments(threadId: number, page: number, size: number): Observable<Page<CommentResponseDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<CommentResponseDto>>(`${this.apiUrl}/${threadId}/comments`, {
      params,
    });
  }

  createComment(threadId: number, content: string): Observable<CommentResponseDto> {
    return this.http.post<CommentResponseDto>(`${this.apiUrl}/${threadId}/comments`, { content });
  }
}
