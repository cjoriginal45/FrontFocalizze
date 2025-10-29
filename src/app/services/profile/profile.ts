import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';
import { ProfileInterface } from '../../interfaces/ProfileInterface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiBaseUrl + '/profiles';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los datos de un perfil de usuario.
   * get the profile data of a user.
   */
  getProfile(username: string): Observable<ProfileInterface> {
    return this.http.get<ProfileInterface>(`${this.apiUrl}/${username}`);
  }

  /**
   * Obtiene los hilos de un usuario de forma paginada.
   * Gets the threads of a user in a paginated way.
   */
  getThreadsForUser(username: string, page: number, size: number): Observable<ThreadResponse[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<ThreadResponse[]>(`${this.apiUrl}/${username}/threads`, { params });
  }
}
