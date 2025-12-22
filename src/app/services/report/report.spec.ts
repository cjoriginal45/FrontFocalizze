import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ReportRequest } from '../../interfaces/ReportRequest';
import { Report } from './report';

describe('Report Service', () => {
  let service: Report;
  let httpMock: HttpTestingController;

  // URL base construida igual que en el servicio para comparaciones exactas
  const API_URL = `${environment.apiBaseUrl}/reports`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Report,
        // Configuración moderna para pruebas HTTP en Angular 18/19/20
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(Report);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificación obligatoria: asegura que no haya solicitudes pendientes ni inesperadas
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('reportUser()', () => {
    it('should send a POST request to report a user', () => {
      // 1. Arrange
      const username = 'offensiveUser';
      const mockReportData: ReportRequest = {
        reason: 'HARASSMENT',
        description: 'User is sending mean messages',
      } as unknown as ReportRequest;

      // 2. Act
      service.reportUser(username, mockReportData).subscribe({
        next: () => {
          // Si el observable se completa con éxito, el test pasa
          expect(true).toBeTrue();
        },
      });

      // 3. Assert
      const req = httpMock.expectOne(`${API_URL}/users/${username}`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockReportData);

      // Simulamos una respuesta vacía (void) con status 200 OK
      req.flush(null);
    });
  });

  describe('reportThread()', () => {
    it('should send a POST request to report a thread', () => {
      // 1. Arrange
      const threadId = 999;
      const mockReportData: ReportRequest = {
        reason: 'SPAM',
        description: 'Thread is full of ads',
      } as unknown as ReportRequest;

      // 2. Act
      service.reportThread(threadId, mockReportData).subscribe({
        next: () => {
          expect(true).toBeTrue();
        },
      });

      // 3. Assert
      const req = httpMock.expectOne(`${API_URL}/threads/${threadId}`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockReportData);

      // Simulamos una respuesta vacía (void) con status 200 OK
      req.flush(null);
    });
  });
});
