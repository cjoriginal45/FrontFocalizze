import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowButtonService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }
  

  public toggleFollow(username: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${username}/follow`, {});
  }
}
