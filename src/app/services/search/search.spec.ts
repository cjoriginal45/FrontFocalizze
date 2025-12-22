import { TestBed } from '@angular/core/testing';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserSearch } from '../../interfaces/UserSearch';
import { ThreadResponse } from '../../interfaces/ThreadResponseDto';
import { Search } from './search';

describe('Search Service', () => {
  let service: Search;
  let httpMock: HttpTestingController;

  const API_URL = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Search,
        // Configuración moderna para pruebas HTTP en Angular 20+
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(Search);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no existan solicitudes HTTP pendientes al finalizar cada test
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchUsers()', () => {
    it('should send a GET request and return a list of users', () => {
      // 1. Arrange: Datos de prueba
      const query = 'john';
      const mockUsers: UserSearch[] = [
        { id: 1, username: 'john_doe', avatarUrl: 'img.png' } as unknown as UserSearch,
      ];

      // La URL esperada debe coincidir con la lógica del servicio
      const expectedUrl = `${API_URL}/search/users?q=${query}`;

      // 2. Act: Ejecución del método
      service.searchUsers(query).subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users).toEqual(mockUsers);
      });

      // 3. Assert: Intercepción de la solicitud
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      // Envío de la respuesta simulada
      req.flush(mockUsers);
    });

    it('should encode special characters in the user query', () => {
      // 1. Arrange
      const query = 'john & jane';
      // encodeURIComponent('john & jane') convierte espacio a %20 y & a %26
      const expectedQuery = 'john%20%26%20jane';
      const expectedUrl = `${API_URL}/search/users?q=${expectedQuery}`;

      // 2. Act
      service.searchUsers(query).subscribe();

      // 3. Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('searchContent()', () => {
    it('should send a GET request and return a list of threads', () => {
      // 1. Arrange
      const query = 'angular';
      const mockThreads: ThreadResponse[] = [
        {
          id: 1,
          title: 'Angular Testing',
          content: 'How to test services...',
        } as unknown as ThreadResponse,
      ];
      const expectedUrl = `${API_URL}/search/content?q=${query}`;

      // 2. Act
      service.searchContent(query).subscribe((threads) => {
        expect(threads.length).toBe(1);
        expect(threads).toEqual(mockThreads);
      });

      // 3. Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');

      req.flush(mockThreads);
    });

    it('should encode special characters in the content query', () => {
      // 1. Arrange
      const query = 'C# & .NET';
      // encodeURIComponent('C# & .NET') -> C%23%20%26%20.NET
      const expectedQuery = 'C%23%20%26%20.NET';
      const expectedUrl = `${API_URL}/search/content?q=${expectedQuery}`;

      // 2. Act
      service.searchContent(query).subscribe();

      // 3. Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
