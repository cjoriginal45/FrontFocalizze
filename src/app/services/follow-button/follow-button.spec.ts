import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FollowButtonService } from './follow-button'; // Asegúrate que el nombre del archivo sea correcto

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
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería llamar a la API de follow correctamente', () => {
    // Arrange
    const type = 'user';
    const id = '123';

    // Act
    service.toggleFollow(type, id).subscribe();

    // Assert
    const req = httpMock.expectOne((request) => request.url.includes('/follow'));
    expect(req.request.method).toBe('POST');
    req.flush({}); // Simula respuesta exitosa
  });
});