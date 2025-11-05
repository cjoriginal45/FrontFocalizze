import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';
import { ProfileInterface } from '../../interfaces/ProfileInterface';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Page } from '../../interfaces/PageInterface';
import { UserInterface } from '../../interfaces/UserInterface';

export interface ProfileUpdateData {
  displayName: string;
  biography: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiBaseUrl + '/profiles';
  private usersApiUrl = environment.apiBaseUrl + '/users';

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
  getThreadsForUser(username: string, page: number, size: number): Observable<Page<FeedThreadDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<FeedThreadDto>>(`${this.apiUrl}/${username}/threads`, { params });
  }

  /**
   * Actualiza los datos de texto de un perfil.
   * Updates the text data of a profile.
   */
  updateProfile(username: string, data: ProfileUpdateData): Observable<ProfileInterface> {
    return this.http.patch<ProfileInterface>(`${this.apiUrl}/${username}`, data);
  }

  /**
   * Sube un nuevo avatar para un usuario.
   * Uploads a new avatar for a user.
   */
  uploadAvatar(username: string, file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file, file.name);

    return this.http.post<{ avatarUrl:string }>(`${this.apiUrl}/${username}/avatar`, formData);
  }


  getUserForFollowButton(username: string): Observable<UserInterface> {
    return this.http.get<UserInterface>(`${this.usersApiUrl}/${username}`);
  }
}
