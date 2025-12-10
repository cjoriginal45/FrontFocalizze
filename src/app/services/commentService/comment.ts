import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Page } from '../../interfaces/PageInterface';
import { CommentResponseDto } from '../../interfaces/CommentResponse';
import { CommentRequestDto } from '../../interfaces/CommentRequest';

@Injectable({
  providedIn: 'root',
})
export class Comment {
  private http = inject(HttpClient);

  // --- URL para acciones DENTRO de un Hilo (GET, POST) ---
  private threadsApiUrl = `${environment.apiBaseUrl}/threads`;

  // --- URL para acciones DIRECTAS sobre un Comentario (DELETE) ---
  private commentsApiUrl = `${environment.apiBaseUrl}/comments`;

  /**
   * Obtiene los comentarios de un hilo específico.
   */
  getComments(threadId: number, page: number, size: number): Observable<Page<CommentResponseDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    // Usamos la URL correcta: /api/threads/{id}/comments
    return this.http.get<Page<CommentResponseDto>>(`${this.threadsApiUrl}/${threadId}/comments`, {
      params,
    });
  }

  /**
   * Crea un nuevo comentario en un hilo específico.
   */
  createComment(threadId: number, content: string): Observable<CommentResponseDto> {
    // Usamos la URL correcta: /api/threads/{id}/comments
    return this.http.post<CommentResponseDto>(`${this.threadsApiUrl}/${threadId}/comments`, {
      content,
    });
  }

  /**
   * Elimina (lógicamente) un comentario.
   */
  deleteComment(commentId: number): Observable<void> {
    
    return this.http.delete<void>(`${this.commentsApiUrl}/${commentId}`);
  }

  /**
   * Edita el contenido de un comentario existente.
   */
  editComment(commentId: number, content: CommentRequestDto): Observable<CommentResponseDto> {
    return this.http.patch<CommentResponseDto>(`${this.commentsApiUrl}/${commentId}`, content);
  }


  /**
   * Responde a un comentario existente.
   */
  replyToComment(commentId: number, content: string): Observable<CommentResponseDto> {
    return this.http.post<CommentResponseDto>(`${this.commentsApiUrl}/${commentId}/reply`, { content });
  }
}
