import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ThreadRequest } from '../../interfaces/ThreadRequest';
import { Observable } from 'rxjs';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';
import { ThreadUpdateRequest } from '../../interfaces/ThreadUpdateRequest';

@Injectable({
  providedIn: 'root',
})
export class threadService {
  private apiUrl = environment.apiBaseUrl + '/thread';

  constructor(private http: HttpClient) {}

  /**
   * Envía una petición para crear un nuevo hilo.
   * @param threadData Los datos para crear el hilo.
   * @returns Un Observable con la respuesta del hilo creado.
   *
   * * Sends a request to create a new thread.
   * @param threadData The data to create the thread.
   * @returns An Observable with the response from the created thread.
   */
  createThread(threadData: ThreadRequest, images: File[]): Observable<ThreadResponse> {
    const formData = new FormData();

    // 1. Agregar el DTO como un Blob JSON
    // Esto es necesario para que Spring Boot lo interprete con @RequestPart("threadRequest")
    formData.append(
      'threadRequest',
      new Blob([JSON.stringify(threadData)], { type: 'application/json' })
    );

    // 2. Agregar las imágenes
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append('images', file);
      });
    }

    // Nota: No establezcas el header 'Content-Type' manualmente,
    // Angular lo hará automáticamente con el boundary correcto para multipart.
    return this.http.post<ThreadResponse>(`${this.apiUrl}/create`, formData);
  }
  /**
   * Obtiene los detalles completos de un hilo por su ID.
   * Esta llamada también incrementará el contador de vistas en el backend.
   * @param id El ID del hilo a solicitar.
   * @returns Un Observable con los datos completos del hilo en formato FeedThreadDto.
   *
   * * Gets the full details of a thread by its ID.
   * This call will also increment the view counter in the backend.
   * @param id The ID of the thread to request.
   * @returns An Observable with the full thread data in FeedThreadDto format.
   */
  getThreadById(id: number): Observable<FeedThreadDto> {
    return this.http.get<FeedThreadDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Envía una petición para actualizar el contenido de un hilo.
   * @param threadId El ID del hilo a actualizar.
   * @param updateData Los nuevos datos para los posts y la categoría.
   * @returns Un Observable con los datos del hilo actualizado.
   */
  updateThread(threadId: number, updateData: ThreadUpdateRequest): Observable<FeedThreadDto> {
    return this.http.patch<FeedThreadDto>(`${this.apiUrl}/${threadId}`, updateData);
  }

  /**
   * Envía una petición para borrar lógicamente un hilo.
   * @param threadId El ID del hilo a borrar.
   * @returns Un Observable<void> que se completa al finalizar.
   */
  deleteThread(threadId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${threadId}`);
  }
}
