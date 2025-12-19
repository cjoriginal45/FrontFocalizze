import { TestBed } from '@angular/core/testing';

import { Auth } from './auth';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { environment } from '../../environments/environment';

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Auth, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  /**
   * Prueba: Creación del servicio
   * Verifica que el servicio Auth se instancia correctamente
   *
   * Test: Creating the Service
   * Verify that the Auth service is instantiated correctly
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    /**
     * Prueba: Login exitoso con almacenamiento de token
     * Verifica que cuando el login es exitoso:
     * - Se envía la petición POST con las credenciales correctas
     * - Se recibe la respuesta esperada
     * - El token JWT se guarda correctamente en el localStorage
     *
     * Test: Successful login with token storage
     * Verify that upon successful login:
     * - The POST request is sent with the correct credentials
     * - The expected response is received
     * - The JWT token is successfully saved in localStorage
     */
    it('should send login request and store token on success', () => {
      // Arrange: Preparar credenciales y respuesta mock
      // Prepare credentials and mock response
      const mockCredentials = { identifier: 'testuser', password: 'password123' };
      const mockResponse: LoginResponse = {
        userId: 1,
        token: 'fake-jwt-token',
        displayName: 'Test User',
        followingCount: 0,
        followersCount: 0,
        role: '',
        isTwoFactorEnabled: false,
        requiresTwoFactor: false
      };

      // Act: Ejecutar el método login y suscribirse a la respuesta
      // Execute the login method and subscribe to the response
      service.login(mockCredentials).subscribe((response) => {
        // Assert: Verificar la respuesta y el almacenamiento del token
        // Verify the response and token storage
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('jwt_token')).toBe('fake-jwt-token');
      });

      // Assert: Verificar que se hizo la petición HTTP correcta
      // Verify that the correct HTTP request was made
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      req.flush(mockResponse);
    });

    /**
     * Prueba: Login exitoso sin token en la respuesta
     * Verifica que cuando el login es exitoso pero no incluye token:
     * - No se guarda nada en el localStorage
     * - La respuesta se procesa correctamente
     *
     * Test: Login successful without token in response
     * Verify that when the login is successful but does not include a token:
     * - Nothing is saved in localStorage
     * - The response is processed correctly
     */
    it('should not store token if response does not have token', () => {
      // Arrange: Preparar respuesta sin token
      // Prepare response without token
      const mockCredentials = { identifier: 'testuser', password: 'password123' };
      const mockResponse: LoginResponse = {
        userId: 1,
        token: '',
        displayName: 'Test User',
        followingCount: 0,
        followersCount: 0,
        role: '',
        isTwoFactorEnabled: false,
        requiresTwoFactor: false
      };

      // Act & Assert
      service.login(mockCredentials).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('jwt_token')).toBeNull(); // No debería guardar token vacío / Should not save empty token
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/login`);
      req.flush(mockResponse);
    });

    /**
     * Prueba: Manejo de error en login
     * Verifica que cuando el servidor retorna un error:
     * - La petición se envía correctamente
     * - El error se propaga al subscriber
     * - No se guarda ningún token en el localStorage
     *
     * Test: Login Error Handling
     * Verify that when the server returns an error:
     * - The request is sent successfully
     * - The error is propagated to the subscriber
     * - No token is saved in localStorage
     */
    it('should handle login error', () => {
      // Arrange: Preparar credenciales inválidas
      // Prepare invalid credentials
      const mockCredentials = { identifier: 'testuser', password: 'wrongpassword' };

      // Act & Assert
      service.login(mockCredentials).subscribe({
        next: () => fail('should have failed with a 401 error'), // El test debería fallar si la petición tiene éxito / The test should fail if the request is successful.
        error: (error) => {
          expect(error.status).toBe(401); // Verificar que es error 401 / Verify that it is error 401
        },
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' }); // Simular error del servidor / Simulate server error
    });
  });

  describe('logout', () => {
    /**
     * Prueba: Logout elimina el token
     * Verifica que el método logout:
     * - Remueve el token JWT del localStorage
     * - Limpia correctamente la sesión
     *
     * Test: Logout deletes the token
     * Verify that the logout method:
     * - Removes the JWT token from localStorage
     * - Correctly clears the session
     */
    it('should remove token from localStorage', () => {
      // Arrange: Simular que hay un token en el localStorage
      // Simulate that there is a token in the localStorage
      localStorage.setItem('jwt_token', 'fake-token');

      // Act: Ejecutar logout
      // Execute logout
      service.logout();

      // Assert: Verificar que el token fue removido
      // Verify that the token was removed
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    /**
     * Preuba: Usuario autenticado
     * Verifica que isLoggedIn retorna true cuando existe un token en el localStorage
     *
     * Test: Authenticated User
     * Verify that isLoggedIn returns true when a token exists in localStorage
     */
    it('should return true if token exists', () => {
      // Arrange: Simular usuario logueado
      // Simulate logged in user
      localStorage.setItem('jwt_token', 'fake-token');

      // Act & Assert
      expect(service.isLoggedIn()).toBeTrue();
    });

    /**
     * Test: Usuario no autenticado
     * Verifica que isLoggedIn retorna false cuando no hay token en el localStorage
     *
     * Test: Unauthenticated User
     * Verify that isLoggedIn returns false when there is no token in localStorage
     */
    it('should return false if token does not exist', () => {
      // Arrange: Asegurar que no hay token
      // Ensure there is no token
      localStorage.removeItem('jwt_token');

      // Act & Assert
      expect(service.isLoggedIn()).toBeFalse();
    });
  });
});
