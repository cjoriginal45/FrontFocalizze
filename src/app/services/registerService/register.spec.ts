import { TestBed } from '@angular/core/testing';

import { RegisterService } from './register';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

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
});
