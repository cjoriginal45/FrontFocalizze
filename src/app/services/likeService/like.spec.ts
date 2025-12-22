import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';
import { Like } from './like';

describe('Like Service', () => {
  let service: Like;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl}/thread`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Like,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(Like);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería llamar al endpoint de like con el ID de hilo correcto', () => {
    // Arrange
    const threadId = 505;

    // Act
    service.toggleLike(threadId).subscribe();

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/${threadId}/like`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({}); // Verificamos cuerpo vacío
    req.flush(null);
  });

  it('debería manejar errores de servidor (500) al dar like', () => {
    // Act
    service.toggleLike(1).subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    // Assert
    const req = httpMock.expectOne(`${baseUrl}/1/like`);
    req.flush('Error de servidor', { status: 500, statusText: 'Internal Server Error' });
  });
});