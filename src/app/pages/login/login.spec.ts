import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { Login } from './login';
import { Auth } from '../../services/auth/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginResponse } from '../../interfaces/LoginResponse';
import { of, throwError } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: jasmine.SpyObj<Auth>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('Auth', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: Auth, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    authService = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  /**
   * Prueba: Creación del componente
   * Verifica que el componente Login se instancia correctamente
   *
   * Test: Creating the component
   * Verify that the Login component is instantiated correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Prueba: Valores iniciales del componente
   * Verifica que el componente se inicializa con los valores por defecto correctos:
   * - Formulario vacío
   * - Sin mensajes de error
   * - Contraseña oculta
   * - Icono de visibilidad correcto
   *
   * Test: Component Initial Values
   * Verify that the component is initialized with the correct default values:
   * - Empty form
   * - No error messages
   * - Hidden password
   * - Correct icon visibility
   */
  it('should initialize with default values', () => {
    expect(component.loginData.identifier).toBe('');
    expect(component.loginData.password).toBe('');
    expect(component.errorMessage).toBeNull();
    expect(component.passwordInputType).toBe('password');
    expect(component.showPasswordIcon).toBe('visibility');
  });

  /**
   * Prueba: Alternar visibilidad de contraseña
   * Verifica que el método togglePasswordVisibility:
   * - Cambia el tipo de input entre 'password' y 'text'
   * - Actualiza el icono correctamente entre 'visibility' y 'visibility_off'
   *
   * Test: Toggle Password Visibility
   * Verify that the togglePasswordVisibility method:
   * - Changes the input type between 'password' and 'text'
   * - Correctly updates the icon between 'visibility' and 'visibility_off'
   */
  it('should toggle password visibility', () => {
    // Estado inicial: contraseña oculta
    expect(component.passwordInputType).toBe('password');
    expect(component.showPasswordIcon).toBe('visibility');

    // Primera llamada: mostrar contraseña
    component.togglePasswordVisibility();
    expect(component.passwordInputType).toBe('text');
    expect(component.showPasswordIcon).toBe('visibility_off');

    // Segunda llamada: ocultar contraseña
    component.togglePasswordVisibility();
    expect(component.passwordInputType).toBe('password');
    expect(component.showPasswordIcon).toBe('visibility');
  });

  /**
   * Prueba: Limpieza de recursos en ngOnDestroy
   * Verifica que cuando el componente se destruye:
   * - Se limpian los temporizadores activos para prevenir memory leaks
   *
   * Test: Resource Cleanup in ngOnDestroy
   * Verifies that when the component is destroyed:
   * - Active timers are cleared to prevent memory leaks
   */
  it('should clear error message on destroy', () => {
    // Arrange: Simular que hay un temporizador activo
    component['errorTimer'] = setTimeout(() => {}, 5000);
    spyOn(window, 'clearTimeout');

    // Act: Ejecutar ngOnDestroy
    component.ngOnDestroy();

    // Assert: Verificar que se llamó a clearTimeout
    expect(window.clearTimeout).toHaveBeenCalledWith(component['errorTimer']);
  });

  describe('onSubmit', () => {
    /**
     * Prueba: Envío exitoso del formulario
     * Verifica que cuando el login es exitoso:
     * - Se llama al servicio Auth con los datos correctos
     * - Se navega a la página '/feed'
     * - No se establecen mensajes de error
     *
     * * Test: Form submission successful
     * Verify that upon successful login:
     * - The Auth service is called with the correct data
     * - Navigates to the '/feed' page
     * - No error messages are set
     */
    it('should login successfully and navigate to feed', fakeAsync(() => {
      // Arrange: Configurar respuesta exitosa del servicio
      // Configure successful service response
      const mockResponse: LoginResponse = {
        userId: 1,
        token: 'fake-jwt-token',
        displayName: 'Test User',
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act: Establecer datos y enviar formulario
      // Establecer datos y enviar formulario
      component.loginData.identifier = 'testuser';
      component.loginData.password = 'password123';
      component.onSubmit();
      tick(); // Avanzar el tiempo para completar operaciones asíncronas / Advance time to complete asynchronous operations

      // Assert: Verificar comportamientos esperados
      // Check expected behaviors
      expect(authService.login).toHaveBeenCalledWith(component.loginData);
      expect(router.navigate).toHaveBeenCalledWith(['/feed']);
      expect(component.errorMessage).toBeNull();
    }));

    /**
     * Prueba: Envío fallido del formulario
     * Verifica que cuando el login falla:
     * - Se establece el mensaje de error correcto
     * - El mensaje de error se limpia automáticamente después de 7 segundos
     *
     * * Test: Form submission failed
     * Verify that when login fails:
     * - The correct error message is set
     * - The error message is automatically cleared after 7 seconds
     */
    it('should set error message on login failure and clear after 7 seconds', fakeAsync(() => {
      // Arrange: Configurar error del servicio
      // Configure service error
      const errorResponse = { status: 401, message: 'Unauthorized' };
      authService.login.and.returnValue(throwError(() => errorResponse));

      // Act: Enviar formulario con credenciales incorrectas
      // Submit form with incorrect credentials
      component.loginData.identifier = 'testuser';
      component.loginData.password = 'wrongpassword';
      component.onSubmit();
      tick();

      // Assert: Verificar que se estableció el mensaje de error
      // Verify that the error message was set
      expect(authService.login).toHaveBeenCalledWith(component.loginData);
      expect(component.errorMessage).toBe(
        'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.'
      );

      // Act & Assert: Avanzar 7 segundos y verificar que el mensaje se limpia
      // Move forward 7 seconds and verify that the message is cleared.
      tick(7000);
      expect(component.errorMessage).toBeNull();
    }));

    /**
     * Prueba: Limpieza inmediata de mensajes de error
     * Verifica que al iniciar un nuevo envío de formulario:
     * - Se limpia inmediatamente cualquier mensaje de error anterior
     * - La UI se actualiza rápidamente para mostrar estado limpio
     *
     * Test: Immediate Clearing of Error Messages
     * Verify that when initiating a new form submission:
     * - Any previous error messages are immediately cleared
     * - The UI quickly refreshes to show a cleared status
     */
    it('should clear error message immediately when starting new submission', () => {
      // Arrange: Configurar un mensaje de error previo
      // Set a pre-error message
      component.errorMessage = 'Error anterior';
      authService.login.and.returnValue(of({} as LoginResponse));

      // Act: Enviar nuevo formulario
      // Submit new form
      component.onSubmit();

      // Assert: El mensaje de error debe limpiarse inmediatamente
      // The error message should be cleared immediately.
      expect(component.errorMessage).toBeNull();
    });
  });

  describe('form validation', () => {
    /**
     * Preuba: Validación de formulario vacío
     * Verifica que cuando el formulario está vacío:
     * - No se llama al servicio de login
     * - Se evitan peticiones innecesarias al servidor
     *
     * Test: Empty Form Validation
     * Verifies that when the form is empty:
     * - The login service is not called
     * - Unnecessary requests to the server are avoided
     */
    it('should not call login service if form is empty', () => {
      // Arrange: Formulario vacío
      // Empty form
      component.loginData.identifier = '';
      component.loginData.password = '';

      // Act: Intentar enviar formulario vacío
      // Try to submit empty form
      component.onSubmit();

      // Assert: No debería llamar al servicio
      // You shouldn't call the service
      expect(authService.login).not.toHaveBeenCalled();
    });

    /**
     * Preuba: Envío con datos válidos
     * Verifica que cuando el formulario tiene datos:
     * - Se llama al servicio con los datos correctos
     * - Los datos se envían en el formato esperado
     *
     * * Test: Submission with valid data
     * Verify that when the form has data:
     * - The service is called with the correct data
     * - The data is submitted in the expected format
     */
    it('should call login service with correct data', () => {
      // Arrange: Configurar datos válidos y respuesta mock
      // Configure valid data and mock response
      const mockResponse: LoginResponse = {
        userId: 1,
        token: 'fake-token',
        displayName: 'Test User',
      };
      authService.login.and.returnValue(of(mockResponse));

      // Act: Establecer datos y enviar formulario
      // Set data and submit form
      component.loginData.identifier = 'test@example.com';
      component.loginData.password = 'password123';
      component.onSubmit();

      // Assert: Verificar que se llamó al servicio con los datos correctos
      // Verify that the service was called with the correct data
      expect(authService.login).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
