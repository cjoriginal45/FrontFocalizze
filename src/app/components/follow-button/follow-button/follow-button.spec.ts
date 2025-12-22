import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowButton } from './follow-button';
import { FollowButtonService } from '../../../services/follow-button/follow-button';
import { MatDialog } from '@angular/material/dialog';
import { UserState } from '../../../services/user-state/user-state';
import { CategoryState } from '../../../services/category-state/category-state';
import { Auth } from '../../../services/auth/auth';
import { TranslateModule } from '@ngx-translate/core';
import { signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { UserInterface } from '../../../interfaces/UserInterface';

describe('FollowButton', () => {
  let component: FollowButton;
  let fixture: ComponentFixture<FollowButton>;

  // --- MOCKS ---
  let followServiceMock: jasmine.SpyObj<FollowButtonService>;
  let dialogMock: jasmine.SpyObj<MatDialog>;
  let userStateMock: jasmine.SpyObj<UserState>;
  let categoryStateMock: jasmine.SpyObj<CategoryState>;
  let authMock: jasmine.SpyObj<Auth>;

  // --- FUENTE DE VERDAD PARA EL TEST ---
  // Definimos explícitamente el tipo de la señal para evitar errores de inferencia
  const mockUserSignal: WritableSignal<UserInterface> = signal({ 
    id: 1, // Corregido: de '1' a 1 (number)
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'assets/images/default-avatar.png',
    isFollowing: false,
    followingCount: 10,
    followersCount: 20,
    isBlocked: false,
    isTwoFactorEnabled: false,
    backgroundType: 'color',
    backgroundValue: '#ffffff'
  });

  beforeEach(async () => {
    followServiceMock = jasmine.createSpyObj('FollowButtonService', ['toggleFollow']);
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    userStateMock = jasmine.createSpyObj('UserState', ['getUserSignal', 'updateFollowingState']);
    categoryStateMock = jasmine.createSpyObj('CategoryState', ['getCategorySignal', 'updateFollowingState']);
    authMock = jasmine.createSpyObj('Auth', ['getCurrentUser', 'updateCurrentUserCounts']);

    await TestBed.configureTestingModule({
      imports: [FollowButton, TranslateModule.forRoot()],
      providers: [
        { provide: FollowButtonService, useValue: followServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: UserState, useValue: userStateMock },
        { provide: CategoryState, useValue: categoryStateMock },
        { provide: Auth, useValue: authMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FollowButton);
    component = fixture.componentInstance;
    
    // Inyectar inputs usando la API de Signal Inputs en el test
    fixture.componentRef.setInput('type', 'user');
    fixture.componentRef.setInput('identifier', 'testuser');
    
    // Configurar el retorno del mock para que devuelva nuestra señal de prueba
    userStateMock.getUserSignal.and.returnValue(mockUserSignal);
    
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería reflejar el cambio de estado cuando la señal del usuario cambia', () => {
    // Arrange: Cambiamos el valor de la señal (fuente de verdad)
    mockUserSignal.update(u => ({ ...u, isFollowing: true }));
    
    // Act
    fixture.detectChanges(); // Trigger computed()

    // Assert
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.textContent).toContain('FOLLOW_BUTTON.FOLLOWING');
    expect(button.classList).toContain('follow-btn--following');
  });

  it('debería ejecutar el toggle de seguimiento optimista al hacer clic', () => {
    // Arrange
    mockUserSignal.update(u => ({ ...u, isFollowing: false }));
    followServiceMock.toggleFollow.and.returnValue(of(void 0));
    fixture.detectChanges();

    // Act
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    // Assert
    expect(userStateMock.updateFollowingState).toHaveBeenCalledWith('testuser', true);
    expect(followServiceMock.toggleFollow).toHaveBeenCalled();
  });

  it('debería manejar el estado de hover correctamente', () => {
    // Arrange
    mockUserSignal.update(u => ({ ...u, isFollowing: true }));
    fixture.detectChanges();

    // Act
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();

    // Assert
    expect(component.isHovering()).toBeTrue();
    expect(button.nativeElement.textContent).toContain('FOLLOW_BUTTON.UNFOLLOW');
  });
});