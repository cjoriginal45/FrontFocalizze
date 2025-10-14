import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { environment } from '../../environments/environment';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Auth, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  /**
   * Prueba: Creación del servicio
   * Verifica que el servicio Auth se instancia correctamente
   *
   * Test: Creating the Service
   * Verify that the Auth service is instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
