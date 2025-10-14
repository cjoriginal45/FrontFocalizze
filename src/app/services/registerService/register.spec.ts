import { TestBed } from '@angular/core/testing';

import { RegisterService } from './register';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RegisterResponse } from '../../interfaces/RegisterResponse';
import { RegisterRequest } from '../../interfaces/RegisterRequest';

describe('RegisterService', () => {
  let service: RegisterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RegisterService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RegisterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificar que no hay peticiones HTTP pendientes después de cada test
    // Verify that there are no pending HTTP requests after each test
    httpMock.verify();
  });

  /**
   * Prueba: Creación del servicio
   * Verifica que el servicio se instancia correctamente
   *
   * Test: Creating the service
   * Verify that the service is instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Prueba: Envío de petición de registro
   * Verifica que el servicio envía una petición POST con los datos correctos y retorna la respuesta del servidor
   *
   * Test: Sending a registration request
   * Verify that the service sends a POST request with the correct data and returns the server response
   */
  it('should send register request and return response', () => {
    // Arrange: Preparar datos de prueba
    // Prepare test data
    const mockRequest: RegisterRequest = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const mockResponse: RegisterResponse = {
      userId: 1,
      username: 'testuser',
      displayName: 'testuser',
      email: 'test@example.com',
      message: 'User registered successfully',
    };

    // Act: Ejecutar el método register
    // Execute the register method
    service.register(mockRequest).subscribe((response) => {
      // Assert: Verificar que la respuesta es la esperada
      // Verify that the response is as expected
      expect(response).toEqual(mockResponse);
    });

    // Assert: Verificar que se hizo la petición HTTP correcta
    // Verify that the correct HTTP request was made
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);

    // Simular respuesta del servidor
    // Simulate server response
    req.flush(mockResponse);
  });
});
