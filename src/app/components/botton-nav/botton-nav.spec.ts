import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottonNav } from './botton-nav';
import { Auth, AuthUser } from '../../services/auth/auth';
import { NotificationState } from '../../services/notification-state/notification-state';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('BottonNav', () => {
  let component: BottonNav;
  let fixture: ComponentFixture<BottonNav>;

  // Mocks con Signals
  let authServiceMock: jasmine.SpyObj<Auth>;
  let notificationStateMock: jasmine.SpyObj<NotificationState>;

  // Datos de prueba
  const mockUser: AuthUser = {
    username: 'johndoe',
    avatarUrl: 'https://example.com/avatar.jpg',
    id: 0,
    displayName: '',
    followingCount: 0,
    followersCount: 0,
    role: '',
    dailyInteractionsRemaining: 0,
  };

  beforeEach(async () => {
    // Arrange: Configuración de Spies con Signals reactivos
    authServiceMock = jasmine.createSpyObj('Auth', [], {
      currentUser: signal<AuthUser | null>(null),
    });

    notificationStateMock = jasmine.createSpyObj('NotificationState', [], {
      hasUnreadNotifications: signal<boolean>(false),
    });

    await TestBed.configureTestingModule({
      imports: [BottonNav],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authServiceMock },
        { provide: NotificationState, useValue: notificationStateMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottonNav);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should NOT show notification dot when hasUnreadNotifications is false', () => {
    // Arrange
    (notificationStateMock as any).hasUnreadNotifications.set(false);

    // Act
    fixture.detectChanges();

    // Assert
    const dot = fixture.debugElement.query(By.css('.notification-dot'));
    expect(dot).toBeNull();
  });

  it('should show notification dot when hasUnreadNotifications is true', () => {
    // Arrange
    const hasUnreadSignal = notificationStateMock.hasUnreadNotifications as any;
    hasUnreadSignal.set(true);

    // Act
    fixture.detectChanges();

    // Assert
    const dot = fixture.debugElement.query(By.css('.notification-dot'));
    expect(dot).not.toBeNull();
  });

  it('should show default icon when user is NOT logged in', () => {
    // Arrange
    (authServiceMock as any).currentUser.set(null);

    // Act
    fixture.detectChanges();

    // Assert
    const icon = fixture.debugElement.query(By.css('mat-icon[textContent="account_circle"]'));
    const img = fixture.debugElement.query(By.css('.mobile-nav__user-avatar'));

    expect(icon).not.toBeNull();
    expect(img).toBeNull();
  });

  it('should show user avatar when user is logged in', () => {
    // Arrange
    const userSignal = authServiceMock.currentUser as any;
    userSignal.set(mockUser);

    // Act
    fixture.detectChanges();

    // Assert
    const img = fixture.debugElement.query(By.css('.mobile-nav__user-avatar'));
    const icon = fixture.debugElement.query(By.css('mat-icon[textContent="account_circle"]'));

    expect(img).not.toBeNull();
    expect(img.nativeElement.src).toContain(mockUser.avatarUrl);
    expect(icon).toBeNull();
  });

  it('should have correct profile link when user is logged in', () => {
    // Arrange
    (authServiceMock as any).currentUser.set(mockUser);

    // Act
    fixture.detectChanges();

    // Assert
    const profileLink = fixture.debugElement.query(By.css('a[routerLink]')).parent;
    // Nota: En pruebas de integración buscaríamos el atributo href resultante
    const links = fixture.debugElement.queryAll(By.css('a'));
    const profileLinkElement = links.find((l) =>
      l.nativeElement.getAttribute('aria-label')?.includes(mockUser.username)
    );

    expect(profileLinkElement).toBeTruthy();
  });
});
