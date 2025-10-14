import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { Register } from './register';
import { RegisterService } from '../../services/registerService/register';
import { Router } from '@angular/router';
import { RegisterResponse } from '../../interfaces/RegisterResponse';
import { of, throwError } from 'rxjs';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let registerService: jasmine.SpyObj<RegisterService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const registerServiceSpy = jasmine.createSpyObj('RegisterService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: RegisterService, useValue: registerServiceSpy },
        { provide: Router, useValue: routerSpy },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    registerService = TestBed.inject(RegisterService) as jasmine.SpyObj<RegisterService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  /**
   * Prueba: Creación del componente
   * Verifica que el componente se crea correctamente
   *
   * Test: Creating the component
   * Verify that the component is created correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Prueba: Alternar visibilidad de contraseña principal
   * Verifica que el tipo de input cambia entre 'password' y 'text'
   * y que el icono se actualiza correctamente
   *
   * Test: Toggle primary password visibility
   * Verify that the input type changes between 'password' and 'text'
   * and that the icon updates correctly
   */
  it('should toggle password visibility', () => {
    // Estado inicial
    // Initial state
    expect(component.passwordInputType).toBe('password');
    expect(component.passwordIcon).toBe('visibility');

    // Primera alternancia: mostrar contraseña
    // First toggle: show password
    component.togglePasswordVisibility();
    expect(component.passwordInputType).toBe('text');
    expect(component.passwordIcon).toBe('visibility_off');

    // Segunda alternancia: ocultar contraseña
    // Second toggle: hide password
    component.togglePasswordVisibility();
    expect(component.passwordInputType).toBe('password');
    expect(component.passwordIcon).toBe('visibility');
  });

  /**
   * Prueba: Alternar visibilidad de confirmación de contraseña
   * Verifica el mismo comportamiento para el campo de confirmación
   *
   * Test: Toggle Password Confirmation Visibility
   * Verify the same behavior for the confirmation field
   */
  it('should toggle confirm password visibility', () => {
    // Estado inicial
    // Initial state
    expect(component.confirmPasswordInputType).toBe('password');
    expect(component.confirmPasswordIcon).toBe('visibility');

    // Primera alternancia: mostrar contraseña
    // First toggle: show password
    component.toggleConfirmPasswordVisibility();
    expect(component.confirmPasswordInputType).toBe('text');
    expect(component.confirmPasswordIcon).toBe('visibility_off');

    // Segunda alternancia: ocultar contraseña
    // Second toggle: hide password
    component.toggleConfirmPasswordVisibility();
    expect(component.confirmPasswordInputType).toBe('password');
    expect(component.confirmPasswordIcon).toBe('visibility');
  });

  /**
   * Prueba: Validación de formulario vacío
   * Verifica que se muestra error cuando algún campo está vacío
   *
   * Test: Empty form validation
   * Verify that an error is displayed when a field is empty
   */
  it('should show error when form is empty', () => {
    component.registerData = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    component.onSubmit();

    expect(component.errorMessage).toBe('Todos los campos son obligatorios');
  });

  /**
   * Prueba: Validación de contraseñas no coincidentes
   * Verifica que se muestra error cuando las contraseñas no coinciden
   *
   * Test: Validation of mismatched passwords
   * Verifies that an error is displayed when passwords do not match
   */
  it('should show error when passwords do not match', () => {
    component.registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
    };

    component.onSubmit();

    expect(component.errorMessage).toBe('Las contraseñas no coinciden');
  });

  /**
   * Prueba: Validación de contraseña muy corta
   * Verifica que se muestra error cuando la contraseña tiene menos de 6 caracteres
   *
   * Test: Very short password validation
   * Verifies that an error is displayed when the password is less than 6 characters long.
   */
  it('should show error when password is too short', () => {
    component.registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: '123',
      confirmPassword: '123',
    };

    component.onSubmit();

    expect(component.errorMessage).toBe('La contraseña debe tener al menos 6 caracteres');
  });

  /**
   * Prueba: Registro exitoso
   * Verifica que cuando el registro es exitoso:
   * - Se desactiva el loading
   * - Se navega a la página de login con parámetros de éxito
   *
   * Test: Registration successful
   * Verify that when registration is successful:
   * - Loading is disabled
   * - Navigate to the login page with success parameters
   */
  it('should register successfully and navigate to login', fakeAsync(() => {
    // Arrange: Configurar respuesta exitosa del servicio
    // Configure successful service response
    const mockResponse: RegisterResponse = {
      userId: 1,
      username: 'testuser',
      displayName: 'testuser',
      email: 'test@example.com',
      message: 'User registered successfully',
    };

    registerService.register.and.returnValue(of(mockResponse));

    component.registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    // Act: Ejecutar el registro
    // Run the registry
    component.onSubmit();
    tick();

    // Assert: Verificar resultados
    // Check results
    expect(component.isLoading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/'], {
      queryParams: { message: 'Registro exitoso. Ya puedes iniciar sesión.' },
    });
  }));

  /**
   * Prueba: Manejo de error en registro
   * Verifica que cuando el servicio retorna error:
   * - Se desactiva el loading
   * - Se muestra el mensaje de error correcto
   *
   * Test: Error handling in logs
   * Verify that when the service returns an error:
   * - Loading is disabled
   * - The correct error message is displayed
   */
  it('should handle registration error', fakeAsync(() => {
    // Arrange: Configurar error del servicio
    // Configure service error
    const errorResponse = { error: { error: 'Username is already taken' } };
    registerService.register.and.returnValue(throwError(() => errorResponse));

    component.registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    // Act: Ejecutar el registro
    // Run the registry
    component.onSubmit();
    tick();

    // Assert: Verificar manejo de error
    // Check error handling

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Username is already taken');
  }));

  /**
   * Prueba: Limpieza automática de mensajes de error
   * Verifica que el mensaje de error se limpia automáticamente después de 7 segundos
   *
   * Test: Automatically clearing error messages
   * Verify that the error message is automatically cleared after 7 seconds
   */
  it('should clear error message after 7 seconds', fakeAsync(() => {
    // Act: Mostrar error y avanzar 7 segundos
    // Show error and advance 7 seconds
    component.showError('Test error');
    expect(component.errorMessage).toBe('Test error');

    tick(7000); // Avanzar 7 segundos / Move forward 7 seconds

    // Assert: Verificar que el mensaje se limpió
    // Verify that the message was cleared
    expect(component.errorMessage).toBe('');
  }));

  /**
   * Prueba: Limpieza de temporizadores al destruir componente
   * Verifica que se limpian los temporizadores cuando el componente se destruye
   * para evitar memory leaks
   *
   * Test: Cleanup timers when destroying a component
   * Verifies that timers are cleared when the component is destroyed
   * to prevent memory leaks
   */
  it('should clear timeout on destroy', () => {
    // Espiar la función clearTimeout
    // Spy on the clearTimeout function
    spyOn(window, 'clearTimeout');

    // Arrange: Crear un escenario donde un timeout exista.
    // Llamamos a showError para que cree el setTimeout y asigne el ID a `component.errorTimeout`
    // Create a scenario where a timeout exists.
    // Call showError to create the setTimeout and assign the ID to `component.errorTimeout`
    component.showError('Error de prueba para el destroy');

    // Act: Ejecutar ngOnDestroy
    // Run ngOnDestroy
    component.ngOnDestroy();

    // Assert: Verificar que se llamó a clearTimeout, porque ahora sí había algo que limpiar
    // Verify that clearTimeout was called, because now there was something to clean up.
    expect(window.clearTimeout).toHaveBeenCalled();
  });
});
