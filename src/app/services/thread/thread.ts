import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ThreadRequest } from '../../interfaces/ThreadRequest';
import { Observable } from 'rxjs';
import { ThreadResponse } from '../../interfaces/ThreadResponse';
import { FeedThreadDto } from '../../interfaces/FeedThread';

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
  createThread(threadData: ThreadRequest): Observable<ThreadResponse> {
    return this.http.post<ThreadResponse>(`${this.apiUrl}/create`, threadData);
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
    // La URL coincide con el endpoint del backend: GET /api/v1/thread/{id}
    return this.http.get<FeedThreadDto>(`${this.apiUrl}/${id}`);
  }
}
