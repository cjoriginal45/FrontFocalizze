import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PasswordReset } from './password-reset';
import { environment } from '../environments/environment';

describe('PasswordReset', () => {
  let service: PasswordReset;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PasswordReset, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PasswordReset);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('forgotPassword()', () => {
    it('debería enviar una petición POST con el email', () => {
      const email = 'test@example.com';

      service.forgotPassword(email).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush(null);
    });
  });

  describe('validateResetToken()', () => {
    it('debería enviar una petición GET con el token como parámetro de consulta', () => {
      const token = 'abc-123';

      service.validateResetToken(token).subscribe();

      // Verificamos la URL con los parámetros de búsqueda
      const req = httpMock.expectOne(
        (request) =>
          request.url === `${apiUrl}/validate-reset-token` && request.params.get('token') === token
      );

      expect(req.request.method).toBe('GET');
      req.flush(null);
    });
  });

  describe('resetPassword()', () => {
    it('debería enviar una petición POST con el token y la nueva contraseña', () => {
      const token = 'abc-123';
      const newPassword = 'newPassword123';

      service.resetPassword(token, newPassword).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ token, newPassword });
      req.flush(null);
    });
  });
});
