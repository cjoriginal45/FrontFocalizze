import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowingDiscovering } from './following-discovering';
import { InteractionCounter } from '../../services/interactionCounter/interaction-counter';
import { Auth } from '../../services/auth/auth';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

// Definimos una interfaz local o importamos la real si está disponible
interface InteractionCount {
  remaining: number;
  limit: number;
}

describe('FollowingDiscovering', () => {
  let component: FollowingDiscovering;
  let fixture: ComponentFixture<FollowingDiscovering>;

  let authServiceSpy: jasmine.SpyObj<Auth>;
  let interactionCounterSpy: jasmine.SpyObj<InteractionCounter>;

  let isLoggedInSignal: WritableSignal<boolean>;
  let remainingInteractionsSignal: WritableSignal<number | null>;
  let interactionLimitSignal: WritableSignal<number | null>;

  // 1. Definimos un objeto de respuesta válido para el Mock
  const mockInteractionResponse: InteractionCount = {
    remaining: 15,
    limit: 20,
      };

  beforeEach(async () => {
    isLoggedInSignal = signal(false);
    remainingInteractionsSignal = signal(null);
    interactionLimitSignal = signal(null);

    authServiceSpy = jasmine.createSpyObj('Auth', ['isLoggedIn'], {
      isLoggedIn: isLoggedInSignal
    });

    interactionCounterSpy = jasmine.createSpyObj('InteractionCounter', ['fetchInitialCount'], {
      remainingInteractions: remainingInteractionsSignal,
      interactionLimit: interactionLimitSignal
    });

    // 2. CORRECCIÓN: Devolvemos el objeto mockInteractionResponse en lugar de void 0
    interactionCounterSpy.fetchInitialCount.and.returnValue(of(mockInteractionResponse));

    await TestBed.configureTestingModule({
      imports: [
        FollowingDiscovering,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authServiceSpy },
        { provide: InteractionCounter, useValue: interactionCounterSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FollowingDiscovering);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar los contadores correctamente cuando el usuario está logueado', async () => {
    // Arrange
    isLoggedInSignal.set(true);
    remainingInteractionsSignal.set(15);
    interactionLimitSignal.set(20);
    
    // Act
    fixture.detectChanges();
    await fixture.whenStable(); // Esperamos a que el effect() del componente se procese
    fixture.detectChanges();

    // Assert
    const interactionsText = fixture.debugElement.query(By.css('.interaction-text')).nativeElement.textContent;
    expect(interactionsText).withContext('El texto del contador debería ser 15 / 20').toContain('15 / 20');
    expect(interactionCounterSpy.fetchInitialCount).toHaveBeenCalled();
  });

  it('debería resetear los contadores al cerrar sesión', async () => {
    // Arrange
    isLoggedInSignal.set(true);
    fixture.detectChanges();
    
    // Act - Simulamos logout
    isLoggedInSignal.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(remainingInteractionsSignal()).toBeNull();
    expect(interactionLimitSignal()).toBeNull();
  });
});