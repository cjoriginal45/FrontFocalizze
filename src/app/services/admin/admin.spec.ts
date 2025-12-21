import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';
import { Page } from '../../interfaces/PageInterface';
import { ReportResponse } from '../../interfaces/ReportResponse';
import { Admin, BanUserRequest, PromoteAdminRequest } from './admin';

describe('Admin Service', () => {
  let service: Admin;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Admin,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(Admin);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no existan peticiones pendientes sin resolver
    httpMock.verify();
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('Reportes', () => {
    it('debería obtener reportes de usuarios pendientes con parámetros de paginación', () => {
      // Arrange
      const mockPage: Page<ReportResponse> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        last: true
      };

      // Act
      service.getPendingReports(0, 10).subscribe((res) => {
        expect(res).toEqual(mockPage);
      });

      // Assert
      const req = httpMock.expectOne((request) => 
        request.url === `${apiUrl}/reports/users` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('debería procesar un reporte de usuario enviando el cuerpo correcto', () => {
      // Act
      service.processReport(1, 'SUSPEND', 7).subscribe();

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/suspend`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        reportId: 1,
        action: 'SUSPEND',
        suspensionDays: 7
      });
      req.flush({});
    });

    it('debería procesar un reporte de hilo mapeando el array de posts al cuerpo del objeto', () => {
      // Arrange
      const posts = ['Texto 1', 'Texto 2', 'Texto 3'];

      // Act
      service.processThreadReport(10, 'EDIT', posts).subscribe();

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/process-thread`);
      expect(req.request.body).toEqual({
        reportId: 10,
        action: 'EDIT',
        newContentPost1: 'Texto 1',
        newContentPost2: 'Texto 2',
        newContentPost3: 'Texto 3'
      });
      req.flush({});
    });
  });

  describe('Gestión de Usuarios y Admin', () => {
    it('debería promover un usuario a admin', () => {
      // Arrange
      const data: PromoteAdminRequest = { targetUsername: 'user1', adminPassword: 'pwd' };

      // Act
      service.promoteUser(data).subscribe();

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/promote`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush({});
    });

    it('debería banear un usuario con la duración especificada', () => {
      // Arrange
      const data: BanUserRequest = {
        targetUsername: 'baduser',
        reason: 'spam',
        duration: 'PERMANENT',
        adminPassword: 'pwd'
      };

      // Act
      service.banUser(data).subscribe();

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/ban`);
      expect(req.request.body.duration).toBe('PERMANENT');
      req.flush({});
    });
  });

  describe('Backup', () => {
    it('debería descargar el backup de la base de datos como un Blob', () => {
      // Arrange
      const mockBlob = new Blob(['dummy content'], { type: 'application/octet-stream' });

      // Act
      service.downloadDatabaseBackup().subscribe((res) => {
        expect(res instanceof Blob).withContext('La respuesta debe ser un objeto Blob').toBeTrue();
        expect(res.size).toBeGreaterThan(0);
      });

      // Assert
      const req = httpMock.expectOne(`${apiUrl}/backup/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  it('debería manejar errores de red correctamente', () => {
    // Act
    service.getPendingReports(0, 10).subscribe({
      next: () => fail('No debería haber tenido éxito'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    // Assert
    const req = httpMock.expectOne((r) => r.url.includes('/reports/users'));
    req.flush('Error de servidor', { status: 500, statusText: 'Server Error' });
  });
});