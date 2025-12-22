import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Page } from '../../interfaces/PageInterface';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { savedThreadsService } from './saved-threads';

describe('SavedThreadsService', () => {
  let service: savedThreadsService;
  let httpMock: HttpTestingController;

  const API_URL = environment.apiBaseUrl + '/saved-threads';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [savedThreadsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(savedThreadsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no existan solicitudes HTTP pendientes al finalizar cada test
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSavedThreads()', () => {
    it('should send a GET request with correct pagination parameters and return mapped data', () => {
      // 1. Arrange: Preparación de datos de prueba
      const page = 0;
      const size = 10;

      const mockThread: FeedThreadDto = {
        id: 101,
        user: { id: 1, username: 'testUser', avatarUrl: 'img.png' } as any,
        publicationDate: '2025-12-22T10:00:00Z',
        posts: ['Contenido del post 1'],
        stats: { likes: 10, comments: 5, views: 100 } as any,
        isLiked: true,
        isSaved: true,
        categoryName: 'Tecnología',
        images: ['img1.jpg'],
      };

      // Definición de la respuesta simulada cumpliendo la estructura de Page<T>
      const mockResponse: Page<FeedThreadDto> = {
        content: [mockThread],
        totalPages: 1,
        totalElements: 1,
        last: true,
        size: 10,
        number: 0,
      };

      // 2. Act: Ejecución del método del servicio
      service.getSavedThreads(page, size).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.last).toBeTrue();
        expect(response.content.length).toBe(1);
      });

      // 3. Assert: Verificación de la solicitud HTTP
      const req = httpMock.expectOne((request) => {
        return (
          request.url === API_URL &&
          request.params.get('page') === page.toString() &&
          request.params.get('size') === size.toString()
        );
      });

      expect(req.request.method).toBe('GET');

      // Envío de la respuesta simulada al servicio
      req.flush(mockResponse);
    });
  });
});
