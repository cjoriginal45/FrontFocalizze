import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FeedService } from './feed'; // IMPORTANTE: Solo importa el servicio
import { environment } from '../../environments/environment';

describe('FeedService', () => {
  let service: FeedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // 1. Proveemos el servicio a testear
        FeedService,
        // 2. Proveemos el cliente HTTP moderno de Angular 20
        provideHttpClient(),
        // 3. Proveemos el motor de pruebas para HTTP
        provideHttpClientTesting(),
      ],
    });

    // Inyectamos el servicio y el controlador de mocks
    service = TestBed.inject(FeedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // 4. Verificamos que no queden peticiones sin responder
    httpMock.verify();
  });

  it('debería crearse el servicio', () => {
    expect(service).withContext('El servicio FeedService no pudo ser instanciado').toBeTruthy();
  });

  it('debería realizar una petición GET con los parámetros de paginación', () => {
    // Arrange
    const page = 0;
    const size = 10;
    const mockResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      last: true
    };

    // Act
    service.getFeed(page, size).subscribe((data) => {
      // Assert
      expect(data).toEqual(mockResponse);
    });

    // Assert de la petición HTTP
    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${environment.apiBaseUrl}/feed` &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10'
      );
    });

    expect(req.request.method).toBe('GET');
    
    // Respondemos con la data falsa
    req.flush(mockResponse);
  });
});