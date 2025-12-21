import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FollowButtonService } from './follow-button';

describe('FollowButtonService', () => {
  let service: FollowButtonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FollowButtonService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(FollowButtonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garantiza que no queden peticiones pendientes
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('toggleFollow()', () => {
    it('debería llamar a la URL de usuario cuando el tipo es "user"', () => {
      // Arrange
      const userId = 'focalizze_user';
      const expectedUrl = `/api/users/${userId}/follow`;

      // Act
      service.toggleFollow('user', userId).subscribe();

      // Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).withContext('Debe ser una petición POST').toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({});
    });

    it('debería llamar a la URL de categoría cuando el tipo es "category"', () => {
      // Arrange
      const categoryId = 42;
      const expectedUrl = `/api/categories/${categoryId}/follow`;

      // Act
      service.toggleFollow('category', categoryId).subscribe();

      // Assert
      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('debería propagar errores de red correctamente', () => {
      // Act
      service.toggleFollow('user', '1').subscribe({
        next: () => fail('No debería tener éxito'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      // Assert
      const req = httpMock.expectOne('/api/users/1/follow');
      req.flush('Error del servidor', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});