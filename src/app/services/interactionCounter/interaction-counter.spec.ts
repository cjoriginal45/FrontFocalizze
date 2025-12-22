import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { InteractionCount, InteractionCounter } from './interaction-counter';

describe('InteractionCounter', () => {
  let service: InteractionCounter;
  let httpMock: HttpTestingController;
  const fullApiUrl = `${environment.apiBaseUrl}/users/me/interactions`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InteractionCounter,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(InteractionCounter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones HTTP pendientes
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchInitialCount()', () => {
    it('debería obtener los contadores de la API y actualizar los Signals', () => {
      // Arrange
      const mockResponse: InteractionCount = { remaining: 5, limit: 10 };

      // Act
      service.fetchInitialCount().subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      // Assert
      const req = httpMock.expectOne(fullApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(service.remainingInteractions()).withContext('Signal de remanente').toBe(5);
      expect(service.interactionLimit()).withContext('Signal de límite').toBe(10);
    });
  });

  describe('decrementCount()', () => {
    it('debería restar 1 al contador de remanentes', () => {
      // Arrange
      service.remainingInteractions.set(5);

      // Act
      service.decrementCount();

      // Assert
      expect(service.remainingInteractions()).toBe(4);
    });

    it('no debería restar por debajo de 0', () => {
      // Arrange
      service.remainingInteractions.set(0);

      // Act
      service.decrementCount();

      // Assert
      expect(service.remainingInteractions()).toBe(0);
    });
  });

  describe('incrementCount()', () => {
    it('debería sumar 1 al contador si es menor al límite', () => {
      // Arrange
      service.remainingInteractions.set(5);
      service.interactionLimit.set(10);

      // Act
      service.incrementCount();

      // Assert
      expect(service.remainingInteractions()).toBe(6);
    });

    it('no debería sumar si ya se alcanzó el límite', () => {
      // Arrange
      service.remainingInteractions.set(10);
      service.interactionLimit.set(10);

      // Act
      service.incrementCount();

      // Assert
      expect(service.remainingInteractions()).toBe(10);
    });

    it('no debería hacer nada si el valor actual es null', () => {
      // Arrange
      service.remainingInteractions.set(null);
      service.interactionLimit.set(10);

      // Act
      service.incrementCount();

      // Assert
      expect(service.remainingInteractions()).toBeNull();
    });
  });
});