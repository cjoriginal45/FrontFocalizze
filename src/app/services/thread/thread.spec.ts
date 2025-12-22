import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../environments/environment';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { threadService } from './thread';

describe('threadService', () => {
  let service: threadService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiBaseUrl + '/thread';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [threadService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(threadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Asegura que no haya peticiones colgadas
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('getThreadById()', () => {
    it('debería obtener un hilo por su ID (GET)', () => {
      const mockThread: Partial<FeedThreadDto> = { id: 123, categoryName: 'Tech' };

      service.getThreadById(123).subscribe((thread) => {
        expect(thread.id).toBe(123);
      });

      const req = httpMock.expectOne(`${baseUrl}/123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockThread);
    });
  });

  describe('updateThread()', () => {
    it('debería enviar una petición PATCH con los datos de actualización', () => {
      const updateData = { posts: ['Nuevo contenido'], categoryId: 1 };
      const mockResponse = { id: 1, ...updateData };

      service.updateThread(1, updateData as any).subscribe((res) => {
        expect(res).toBeDefined();
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });
  });

  describe('deleteThread()', () => {
    it('debería enviar una petición DELETE al ID correcto', () => {
      service.deleteThread(99).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/99`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null); // Simulamos respuesta vacía
    });
  });
});
