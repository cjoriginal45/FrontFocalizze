import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { adminGuard } from './admin-guard';

describe('adminGuard', () => {
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('Auth', ['getCurrentUser']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('debería retornar true si el usuario es ADMIN', () => {
    // Arrange
    authServiceSpy.getCurrentUser.and.returnValue({ username: 'adminUser', role: 'ADMIN' } as any);

    // Act
    const result = TestBed.runInInjectionContext(() => 
      adminGuard({} as any, {} as any)
    );

    // Assert
    expect(result).withContext('Un administrador debería tener acceso permitido').toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debería redirigir a /feed y retornar false si el usuario no es ADMIN', () => {
    // Arrange
    authServiceSpy.getCurrentUser.and.returnValue({ username: 'commonUser', role: 'USER' } as any);

    // Act
    const result = TestBed.runInInjectionContext(() => 
      adminGuard({} as any, {} as any)
    );

    // Assert
    expect(result).withContext('Un usuario normal no debe tener acceso').toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/feed']);
  });

  it('debería redirigir a /feed y retornar false si no hay usuario autenticado', () => {
    // Arrange
    authServiceSpy.getCurrentUser.and.returnValue(null);

    // Act
    const result = TestBed.runInInjectionContext(() => 
      adminGuard({} as any, {} as any)
    );

    // Assert
    expect(result).withContext('Sin sesión activa el acceso debe ser denegado').toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/feed']);
  });
});