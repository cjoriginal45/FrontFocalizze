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
});
