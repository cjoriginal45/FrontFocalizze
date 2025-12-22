import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SecurityService } from './security-service';

describe('SecurityService', () => {
  let service: SecurityService;
  let httpMock: HttpTestingController;

  // Construcción de la URL base esperada
  const API_URL = environment.apiBaseUrl + '/security';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SecurityService,
        // Configuración moderna para pruebas HTTP en Angular 20+
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SecurityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verificación obligatoria: asegura que no haya solicitudes pendientes ni inesperadas
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('toggleTwoFactor()', () => {
    it('should send a PATCH request to enable 2FA', () => {
      // 1. Arrange
      const enable = true;
      const expectedUrl = `${API_URL}/2fa`;
      const expectedBody = { enabled: true };

      // 2. Act
      service.toggleTwoFactor(enable).subscribe({
        next: () => expect(true).toBeTrue(), // Verificar que completa
      });

      // 3. Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(expectedBody);

      req.flush({}); // Respuesta exitosa vacía
    });

    it('should send a PATCH request to disable 2FA', () => {
      // 1. Arrange
      const enable = false;
      const expectedUrl = `${API_URL}/2fa`;
      const expectedBody = { enabled: false };

      // 2. Act
      service.toggleTwoFactor(enable).subscribe();

      // 3. Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(expectedBody);

      req.flush({});
    });
  });

  describe('logoutAllDevices()', () => {
    it('should send a POST request to logout all devices', () => {
      // 1. Arrange
      const expectedUrl = `${API_URL}/logout-all`;

      // 2. Act
      service.logoutAllDevices().subscribe({
        next: () => expect(true).toBeTrue(),
      });

      // 3. Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      // Verificamos que se envíe el objeto vacío como body
      expect(req.request.body).toEqual({});

      req.flush({ message: 'Logged out from all devices' });
    });
  });

  describe('validateCurrentPassword()', () => {
    it('should send a POST request and return true if password is valid', () => {
      // 1. Arrange
      const password = 'securePassword123';
      const expectedUrl = `${API_URL}/validate-password`;
      const expectedBody = { password: password };
      const mockResponse = true;

      // 2. Act
      service.validateCurrentPassword(password).subscribe((isValid) => {
        expect(isValid).toBeTrue();
      });

      // 3. Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedBody);

      req.flush(mockResponse);
    });

    it('should return false if password is invalid', () => {
      // 1. Arrange
      const password = 'wrongPassword';
      const mockResponse = false;

      // 2. Act
      service.validateCurrentPassword(password).subscribe((isValid) => {
        expect(isValid).toBeFalse();
      });

      // 3. Assert
      const req = httpMock.expectOne(`${API_URL}/validate-password`);
      req.flush(mockResponse);
    });
  });
});
