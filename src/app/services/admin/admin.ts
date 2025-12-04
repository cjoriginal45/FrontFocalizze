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
    return this.http.get<Page<ReportResponse>>(`${this.apiUrl}/reports`, { params });
  }

  processReport(reportId: number, action: 'DISMISS' | 'SUSPEND', days?: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/suspend`, { 
      reportId, action, suspensionDays: days 
    });
  }
}
