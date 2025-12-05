import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReportRequest } from '../../interfaces/ReportRequest';

@Injectable({
  providedIn: 'root',
})
export class Report {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/reports`;

  reportUser(username: string, reportData: ReportRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${username}`, reportData);
  }

  reportThread(threadId: number, reportData: ReportRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/threads/${threadId}`, reportData);
  }
}
