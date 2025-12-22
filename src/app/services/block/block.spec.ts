import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Block, BlockResponse } from './block';

describe('Block Service', () => {
  let service: Block;
  let httpMock: HttpTestingController;
  const usersApiUrl = `${environment.apiBaseUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Block,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(Block);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería ejecutar toggleBlock mediante un POST', () => {
    const username = 'annoying_user';
    const mockResponse: BlockResponse = { isBlocked: true };

    service.toggleBlock(username).subscribe((res) => {
      expect(res.isBlocked).toBeTrue();
    });

    const req = httpMock.expectOne(`${usersApiUrl}/${username}/block`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('debería obtener la lista de usuarios bloqueados', () => {
    service.getBlockedUsers().subscribe();

    const req = httpMock.expectOne(`${usersApiUrl}/blocked`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});