import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RegisterRequest } from '../../interfaces/RegisterRequest';
import { RegisterResponse } from '../../interfaces/RegisterResponse';
import { RegisterService } from './register';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;

  // URL esperada derivada del entorno
  const EXPECTED_URL = `${environment.apiBaseUrl}/auth/register`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RegisterService,
        // Configuración moderna para testing HTTP en Angular 18/19/20
        // Reemplaza al antiguo HttpClientTestingModule
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificación crucial: asegura que no haya solicitudes pendientes ni inesperadas
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register()', () => {
    it('should send a POST request with correct body and return response', () => {
      // 1. Arrange (Preparar datos)
      const mockRequest: RegisterRequest = {
        username: 'newUser',
        email: 'test@mail.com',
        password: 'password123',
        displayName: 'New User',
      } as unknown as RegisterRequest;

      const mockResponse: RegisterResponse = {
        id: 1,
        username: 'newUser',
        token: 'fake-jwt-token',
      } as unknown as RegisterResponse;

      // 2. Act (Ejecutar método)
      service.register(mockRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // 3. Assert (Verificar petición HTTP)
      const req = httpMock.expectOne(EXPECTED_URL);

      // Verificamos método HTTP
      expect(req.request.method).toBe('POST');

      // Verificamos que el cuerpo de la petición sea el correcto
      expect(req.request.body).toEqual(mockRequest);

      // Simulamos la respuesta del backend
      req.flush(mockResponse);
    });

    it('should handle server errors gracefully', () => {
      // 1. Arrange
      const mockRequest: RegisterRequest = {
        username: 'existingUser',
        password: '123',
      } as unknown as RegisterRequest;

      const status = 409;
      const statusText = 'Conflict';
      const errorMsg = 'Username already exists';

      // 2. Act
      service.register(mockRequest).subscribe({
        next: () => fail('Should have failed with 409 error'),
        error: (error) => {
          // 3. Assert
          expect(error.status).toBe(status);
          expect(error.statusText).toBe(statusText);
        },
      });

      // Assert HTTP request
      const req = httpMock.expectOne(EXPECTED_URL);

      // Simulamos un error del servidor
      req.flush(errorMsg, { status, statusText });
    });
  });
});
