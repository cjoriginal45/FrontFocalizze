import { TestBed } from '@angular/core/testing';
import { Auth } from '../auth/auth';
import { signal, WritableSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { authReadyGuard } from './auth-ready-guard';

describe('authReadyGuard', () => {
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let authReadySignal: WritableSignal<boolean>;

  beforeEach(() => {
    // Arrange: Crear señal y spy
    authReadySignal = signal(false);
    authServiceSpy = jasmine.createSpyObj('Auth', [], {
      authReady: authReadySignal
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: authServiceSpy }
      ]
    });
  });

  it('debería esperar (bloquear) hasta que authReady sea true y luego emitir', async () => {
    // Arrange
    authReadySignal.set(false);

    // Act: Ejecutamos el guard dentro del contexto de inyección
    const guardPromise = TestBed.runInInjectionContext(() => {
      return firstValueFrom(authReadyGuard({} as any, {} as any) as any);
    });

    // Simulamos que el proceso de carga termina tras un breve tiempo
    authReadySignal.set(true);

    const result = await guardPromise;

    // Assert
    expect(result).withContext('El guard debe emitir true cuando la señal cambie a true').toBeTrue();
  });

  it('debería resolver inmediatamente si authReady ya es true', async () => {
    // Arrange
    authReadySignal.set(true);

    // Act
    const result = await TestBed.runInInjectionContext(() => {
      return firstValueFrom(authReadyGuard({} as any, {} as any) as any);
    });

    // Assert
    expect(result).withContext('El guard no debe bloquear si el estado ya es ready').toBeTrue();
  });
});