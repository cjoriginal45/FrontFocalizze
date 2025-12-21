import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Page } from '../../interfaces/PageInterface';
import { DiscoverItemDto } from '../../interfaces/DiscoverItemDto';
import { DiscoverFeed } from './discover-feed';

describe('DiscoverFeed Service', () => {
  let service: DiscoverFeed;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/feed/discover`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DiscoverFeed,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DiscoverFeed);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garantiza que no haya peticiones sin validar
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener el feed de descubrimiento con paginación', () => {
    // Arrange
    const mockPage: Page<DiscoverItemDto> = {
      content: [], totalElements: 0, totalPages: 0, size: 10, number: 0, last: true
    };

    // Act
    service.getDiscoverFeed(0, 10).subscribe((res) => {
      expect(res).toEqual(mockPage);
    });

    // Assert
    const req = httpMock.expectOne((r) => 
      r.url === apiUrl && 
      r.params.get('page') === '0' && 
      r.params.get('size') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('debería enviar feedback para ocultar un hilo (hideThread)', () => {
    // Arrange
    const threadId = 123;
    const reason = 'SPAM';
    const hideUrl = `${environment.apiBaseUrl}/feed/feedback/hide`;

    // Act
    service.hideThread(threadId, reason).subscribe();

    // Assert
    const req = httpMock.expectOne((r) => 
      r.url === hideUrl &&
      r.params.get('threadId') === '123' &&
      r.params.get('reasonType') === 'SPAM'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({}); // El body debe estar vacío según el servicio
    req.flush(null);
  });
});