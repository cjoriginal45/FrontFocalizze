import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Save } from './save';

describe('Save Service', () => {
  let service: Save;
  let httpMock: HttpTestingController;

  // URL base esperada según la lógica del servicio
  const API_URL = `${environment.apiBaseUrl}/thread`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Save,
        // Configuración moderna para pruebas HTTP en Angular 20+
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(Save);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden solicitudes HTTP pendientes al finalizar cada test
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('toggleSave()', () => {
    it('should send a POST request to save/unsave a thread', () => {
      // 1. Arrange: Datos de prueba
      const threadId = 123;
      const expectedUrl = `${API_URL}/${threadId}/save`;

      // 2. Act: Llamada al método del servicio
      service.toggleSave(threadId).subscribe({
        next: () => {
          // Verificación de éxito si el observable se completa
          expect(true).toBeTrue();
        },
      });

      // 3. Assert: Intercepción y validación de la solicitud HTTP
      const req = httpMock.expectOne(expectedUrl);

      // Verificamos método HTTP
      expect(req.request.method).toBe('POST');

      // Verificamos que se envíe un cuerpo vacío como espera el backend
      expect(req.request.body).toEqual({});

      // Simulamos una respuesta exitosa (void) con status 200
      req.flush(null);
    });
  });
});
