import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ProfileInterface } from '../../interfaces/ProfileInterface';
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { Page } from '../../interfaces/PageInterface';
import { UserInterface } from '../../interfaces/UserInterface';
import { UserProfileDownload } from '../../interfaces/UserProfileDownload';
import { UserSummary } from '../../interfaces/UserSummary';
import { ProfileService, ProfileUpdateData } from './profile';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;

  // Base URL derivada del entorno (para verificar las rutas)
  const API_URL = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        // Configuración moderna para testing de HTTP en Angular 20+
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden peticiones pendientes después de cada test
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Profiles Endpoint (/profiles)', () => {
    it('getProfile should return profile data', () => {
      // Arrange
      const username = 'testuser';
      const mockProfile: ProfileInterface = {
        id: 1,
        username: 'testuser',
        displayName: 'Test',
        biography: 'Bio',
      } as unknown as ProfileInterface;

      // Act
      service.getProfile(username).subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });

      // Assert
      const req = httpMock.expectOne(`${API_URL}/profiles/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });

    it('getThreadsForUser should return paginated threads with correct params', () => {
      // Arrange
      const username = 'testuser';
      const page = 0;
      const size = 10;
      const mockPage: Page<FeedThreadDto> = {
        content: [],
        totalPages: 1,
        totalElements: 0,
        size: 10,
        number: 0,
      } as unknown as Page<FeedThreadDto>;

      // Act
      service.getThreadsForUser(username, page, size).subscribe((response) => {
        expect(response).toEqual(mockPage);
      });

      // Assert
      // Verificamos URL y parámetros de consulta
      const req = httpMock.expectOne(
        (request) =>
          request.url === `${API_URL}/profiles/${username}/threads` &&
          request.params.get('page') === '0' &&
          request.params.get('size') === '10'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('updateProfile should patch profile data', () => {
      // Arrange
      const username = 'testuser';
      const updateData: ProfileUpdateData = { displayName: 'New Name', biography: 'New Bio' };
      const mockResponse: ProfileInterface = { ...updateData } as unknown as ProfileInterface;

      // Act
      service.updateProfile(username, updateData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${API_URL}/profiles/${username}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });

    it('uploadAvatar should post FormData and return avatarUrl', () => {
      // Arrange
      const username = 'testuser';
      const mockFile = new File([''], 'avatar.png', { type: 'image/png' });
      const mockResponse = { avatarUrl: 'http://url/avatar.png' };

      // Act
      service.uploadAvatar(username, mockFile).subscribe((response) => {
        expect(response.avatarUrl).toBe(mockResponse.avatarUrl);
      });

      // Assert
      const req = httpMock.expectOne(`${API_URL}/profiles/${username}/avatar`);
      expect(req.request.method).toBe('POST');
      // Verificamos que el body sea instancia de FormData
      expect(req.request.body instanceof FormData).toBeTrue();
      // Verificamos que el archivo esté adjunto con la clave correcta
      const formData = req.request.body as FormData;
      expect(formData.has('avatar')).toBeTrue();
      req.flush(mockResponse);
    });

    it('getProfileForDownload should return user profile download data', () => {
      // Arrange
      const username = 'testuser';
      const mockDownload: UserProfileDownload = {
        username: 'testuser',
      } as unknown as UserProfileDownload;

      // Act
      service.getProfileForDownload(username).subscribe((data) => {
        expect(data).toEqual(mockDownload);
      });

      // Assert
      const req = httpMock.expectOne(`${API_URL}/profiles/${username}/download`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDownload);
    });
  });

  describe('Users Endpoint (/users)', () => {
    it('getUserForFollowButton should return user interface data', () => {
      // Arrange
      const username = 'testuser';
      const mockUser: UserInterface = { id: 1, username: 'testuser' } as unknown as UserInterface;

      // Act
      service.getUserForFollowButton(username).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      // Assert
      // Nota: Este endpoint usa this.usersApiUrl (/users)
      const req = httpMock.expectOne(`${API_URL}/users/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('getFollowers should return list of followers', () => {
      // Arrange
      const username = 'testuser';
      const mockFollowers: UserSummary[] = [{ username: 'follower1' }] as unknown as UserSummary[];

      // Act
      service.getFollowers(username).subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users).toEqual(mockFollowers);
      });

      // Assert
      const req = httpMock.expectOne(`${API_URL}/users/${username}/followers`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFollowers);
    });

    it('getFollowing should return list of following users', () => {
      // Arrange
      const username = 'testuser';
      const mockFollowing: UserSummary[] = [{ username: 'following1' }] as unknown as UserSummary[];

      // Act
      service.getFollowing(username).subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users).toEqual(mockFollowing);
      });

      // Assert
      const req = httpMock.expectOne(`${API_URL}/users/${username}/following`);
      expect(req.request.method).toBe('GET');
      req.flush(mockFollowing);
    });
  });
});
