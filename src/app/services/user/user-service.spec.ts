import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UserInterface } from '../../interfaces/UserInterface';
import { InteractionStatus } from '../../interfaces/InteractionStatus';
import { UserService } from './user-service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no haya peticiones sin responder
    httpMock.verify();
  });

  it('debería crearse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('getMe()', () => {
    it('debería solicitar los datos del usuario logueado vía GET', () => {
      const mockUser = { username: 'testuser', displayName: 'Test' } as UserInterface;

      service.getMe().subscribe((user) => {
        expect(user.username).toBe('testuser');
      });

      const req = httpMock.expectOne('/api/users/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('getInteractionStatus()', () => {
    it('debería solicitar los estados de interacción vía GET', () => {
      // Usamos any para evitar errores de tipado si la interfaz es compleja
      const mockStatus = { likedThreads: [], savedThreads: [] } as any;

      service.getInteractionStatus().subscribe((status) => {
        expect(status).toBeDefined();
      });

      const req = httpMock.expectOne('/api/users/me/interactions');
      expect(req.request.method).toBe('GET');
      req.flush(mockStatus);
    });
  });
});
