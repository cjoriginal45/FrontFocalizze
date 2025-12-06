import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../../interfaces/PageInterface';
import { ReportResponse } from '../../interfaces/ReportResponse';

@Injectable({
  providedIn: 'root',
})
export class Admin {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  getPendingReports(page: number, size: number): Observable<Page<ReportResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReportResponse>>(`${this.apiUrl}/reports/users`, { params });
  }

  processReport(reportId: number, action: 'DISMISS' | 'SUSPEND', days?: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/suspend`, { 
      reportId, action, suspensionDays: days 
    });
  }

  getPendingThreadReports(page: number, size: number): Observable<Page<ReportResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReportResponse>>(`${this.apiUrl}/reports/threads`, { params });
  }

  processThreadReport(reportId: number, action: 'DISMISS' | 'DELETE' | 'EDIT', posts?: string[]): Observable<void> {
    const body = {
      reportId,
      action,
      newContentPost1: posts?.[0],
      newContentPost2: posts?.[1],
      newContentPost3: posts?.[2]
    };
    return this.http.post<void>(`${this.apiUrl}/process-thread`, body);
  }

  deleteAdmin(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${username}`);
  }
}
