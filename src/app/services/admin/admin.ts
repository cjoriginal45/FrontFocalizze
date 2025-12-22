import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../../interfaces/PageInterface';
import { ReportResponse } from '../../interfaces/ReportResponse';

// Solicitudes para promover y revocar administradores, y para banear usuarios
export interface PromoteAdminRequest {
  targetUsername: string;
  adminPassword: string;
}

// Solicitud para revocar privilegios de administrador
export interface RevokeAdminRequest {
  targetUsername: string;
  adminPassword: string;
}

// Solicitud para banear usuarios
export interface BanUserRequest {
  targetUsername: string;
  reason: string;
  duration: 'WEEK' | 'MONTH' | 'PERMANENT';
  adminPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class Admin {
  // Inyección del HttpClient para realizar solicitudes HTTP
  private http = inject(HttpClient);
  // URL base para las operaciones administrativas
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  // Obtener reportes de usuarios pendientes con paginación
  getPendingReports(page: number, size: number): Observable<Page<ReportResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReportResponse>>(`${this.apiUrl}/reports/users`, { params });
  }

  // Procesar un reporte de usuario (descartar o suspender)
  processReport(reportId: number, action: 'DISMISS' | 'SUSPEND', days?: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/suspend`, {
      reportId,
      action,
      suspensionDays: days,
    });
  }

  // Obtener reportes de hilos pendientes con paginación
  getPendingThreadReports(page: number, size: number): Observable<Page<ReportResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReportResponse>>(`${this.apiUrl}/reports/threads`, { params });
  }

  // Procesar un reporte de hilo (descartar, eliminar o editar)
  processThreadReport(
    reportId: number,
    action: 'DISMISS' | 'DELETE' | 'EDIT',
    posts?: string[]
  ): Observable<void> {
    const body = {
      reportId,
      action,
      newContentPost1: posts?.[0],
      newContentPost2: posts?.[1],
      newContentPost3: posts?.[2],
    };
    return this.http.post<void>(`${this.apiUrl}/process-thread`, body);
  }

  // Promover un usuario a administrador
  promoteUser(data: PromoteAdminRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/promote`, data);
  }

  // Revocar privilegios de administrador a un usuario
  revokeAdmin(data: RevokeAdminRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/revoke`, data);
  }

  // Banear a un usuario
  banUser(data: BanUserRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/ban`, data);
  }

  // Descargar una copia de seguridad de la base de datos
  downloadDatabaseBackup(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backup/download`, {
      responseType: 'blob', // Importante: Indica que esperamos un archivo binario
    });
  }
}
