import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Category } from './category';

describe('Category Service (API)', () => {
  let service: Category;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/categories`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Category,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(Category);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener todas las categorías', () => {
    service.getAllCategories().subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('debería obtener detalles de una categoría por nombre', () => {
    const categoryName = 'Tech';
    service.getCategoryDetails(categoryName).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/${categoryName}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('debería obtener hilos de una categoría con parámetros de paginación', () => {
    const name = 'Tech';
    service.getThreadsForCategory(name, 0, 10).subscribe();

    const req = httpMock.expectOne((r) => 
      r.url === `${apiUrl}/${name}/threads` &&
      r.params.get('page') === '0' &&
      r.params.get('size') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});