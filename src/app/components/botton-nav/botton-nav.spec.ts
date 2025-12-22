import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BottonNav } from './botton-nav';
import { Auth, AuthUser } from '../../services/auth/auth';
import { NotificationState } from '../../services/notification-state/notification-state';
import { signal, WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('BottonNav', () => {
  let component: BottonNav;
  let fixture: ComponentFixture<BottonNav>;

  // Definimos los mocks con tipos de Signal editables para el test
  let currentUserSignal: WritableSignal<AuthUser | null>;
  let hasNotificationsSignal: WritableSignal<boolean>;

  const mockUser: AuthUser = {
    username: 'johndoe',
    avatarUrl: 'https://example.com/avatar.jpg',
    id: 1,
    displayName: 'John Doe',
    followingCount: 0,
    followersCount: 0,
    role: 'user',
    dailyInteractionsRemaining: 10,
  };

  beforeEach(async () => {
    // Inicializamos las señales reales para el mock
    currentUserSignal = signal<AuthUser | null>(null);
    hasNotificationsSignal = signal<boolean>(false);

    // Creamos los Spies pero inyectamos nuestras señales
    const authSpy = jasmine.createSpyObj('Auth', [], {
      currentUser: currentUserSignal
    });

    const notificationSpy = jasmine.createSpyObj('NotificationState', [], {
      hasUnreadNotifications: hasNotificationsSignal
    });

    await TestBed.configureTestingModule({
      imports: [BottonNav],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authSpy },
        { provide: NotificationState, useValue: notificationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottonNav);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show notification dot when hasUnreadNotifications is true', () => {
    // Arrange
    hasNotificationsSignal.set(true);

    // Act
    fixture.detectChanges(); // Importante para OnPush con Signals

    // Assert
    const dot = fixture.debugElement.query(By.css('.notification-dot'));
    expect(dot).not.toBeNull();
  });

  it('should show default icon when user is NOT logged in', () => {
    // Arrange
    currentUserSignal.set(null);

    // Act
    fixture.detectChanges();

    // Assert
    // Corrección del selector: Buscamos el mat-icon y verificamos su texto
    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    const profileIcon = icons.find(el => el.nativeElement.textContent === 'account_circle');
    
    expect(profileIcon).withContext('No se encontró el icono account_circle').toBeTruthy();
    
    const img = fixture.debugElement.query(By.css('.mobile-nav__user-avatar'));
    expect(img).toBeNull();
  });

  it('should show user avatar when user is logged in', () => {
    // Arrange
    currentUserSignal.set(mockUser);

    // Act
    fixture.detectChanges();

    // Assert
    const img = fixture.debugElement.query(By.css('.mobile-nav__user-avatar'));
    expect(img).not.toBeNull();
    expect(img.nativeElement.src).toContain(mockUser.avatarUrl);

    // Verificamos que el icono por defecto NO esté
    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    const profileIcon = icons.find(el => el.nativeElement.textContent === 'account_circle');
    expect(profileIcon).toBeFalsy();
  });

  it('should have correct profile link when user is logged in', () => {
    // Arrange
    currentUserSignal.set(mockUser);

    // Act
    fixture.detectChanges();

    // Assert
    // 1. Primero verificamos que la imagen del avatar existe
    const avatarImg = fixture.debugElement.query(By.css('.mobile-nav__user-avatar'));
    expect(avatarImg).toBeTruthy('No se encontró la imagen del avatar');

    // 2. Verificamos que el padre de esa imagen sea un enlace (<a>)
    const anchorElement = avatarImg.nativeElement.closest('a');
    expect(anchorElement).withContext('El avatar no está envuelto en un tag <a>').toBeTruthy();

    // 3. (Opcional) Verificar que la ruta sea correcta
    const href = anchorElement.getAttribute('href');
    // Nota: RouterLink en tests a veces requiere configuración extra para ver el href real,
    // pero verificar que el elemento existe es suficiente para una prueba unitaria.
    expect(href).withContext('El link debe contener el nombre de usuario').toContain(mockUser.username);
  });
});