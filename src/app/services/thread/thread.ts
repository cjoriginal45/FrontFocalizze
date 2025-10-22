import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ThreadRequest } from '../../interfaces/ThreadRequest';
import { Observable } from 'rxjs';
import { ThreadResponse } from '../../interfaces/ThreadResponse';

@Injectable({
  providedIn: 'root'
})
export class Thread {
  private apiUrl = environment.apiBaseUrl+'/thread';

  constructor(private http: HttpClient) { }

  createThread(threadData: ThreadRequest): Observable<ThreadResponse> {
    return this.http.post<ThreadResponse>(`${this.apiUrl}/create`, threadData);
  }
}
