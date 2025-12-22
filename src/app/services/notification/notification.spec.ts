import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { NotificationInterface } from '../../interfaces/NotificationInterface';
import { Page } from '../../interfaces/PageInterface';
import { Notification } from './notification';

describe('Notification Service', () => {
  let service: Notification;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/notifications`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Notification,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(Notification);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garantiza que no haya peticiones inesperadas
  });

  it('debería obtener una página de notificaciones con parámetros correctos', () => {
    // Arrange
    const mockPage: Page<NotificationInterface> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      last: true
    };

    // Act
    service.getNotifications(0, 10).subscribe((res) => {
      expect(res).toEqual(mockPage);
    });

    // Assert
    const req = httpMock.expectOne((request) => 
      request.url === apiUrl &&
      request.params.get('page') === '0' &&
      request.params.get('size') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('debería consultar el estado de notificaciones no leídas (checkUnread)', () => {
    // Arrange
    const mockResponse = { hasUnread: true };

    // Act
    service.checkUnread().subscribe((res) => {
      expect(res.hasUnread).toBeTrue();
    });

    // Assert
    const req = httpMock.expectOne(`${apiUrl}/unread`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería enviar una petición POST para marcar todas como leídas', () => {
    // Act
    service.markAllAsRead().subscribe();

    // Assert
    const req = httpMock.expectOne(`${apiUrl}/mark-as-read`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(null);
  });
});