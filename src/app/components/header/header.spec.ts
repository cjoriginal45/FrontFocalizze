import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { Auth, AuthUser } from '../../services/auth/auth';
import { NotificationState } from '../../services/notification-state/notification-state';
import { Theme } from '../../services/themeService/theme';
import { Responsive } from '../../services/responsive/responsive';
import { Component, forwardRef, Input, signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Menu } from '../menu/menu';
import { SearchBar } from '../search-bar/search-bar';

// --- MOCK COMPONENTS ---
// Necesarios para cumplir viewChild.required y evitar dependencias profundas
@Component({
  selector: 'app-menu',
  standalone: true,
  template: '',
  providers: [{ provide: Menu, useExisting: forwardRef(() => MockMenu) }],
})
class MockMenu {
  @Input() isMobile$: any;
  toggle() {}
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  template: '',
})
class MockSearchBar {}

describe('Header Component', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  // Mocks de Servicios
  let authServiceMock: any;
  let notificationStateMock: any;
  let themeServiceMock: any;
  let responsiveServiceMock: any;

  // Signals simulados para reactividad en tests
  let currentUserSig: WritableSignal<AuthUser | null>;
  let hasUnreadSig: WritableSignal<boolean>;
  let currentThemeSig: WritableSignal<'light' | 'dark'>;

  const mockUser: AuthUser = {
    id: 1,
    username: 'testUser',
    displayName: 'Test',
    followingCount: 0,
    followersCount: 0,
    role: 'USER',
    dailyInteractionsRemaining: 10,
    avatarUrl: 'https://avatar.com/img.png',
  };

  beforeEach(async () => {
    // 1. Setup Signals
    currentUserSig = signal<AuthUser | null>(null);
    hasUnreadSig = signal<boolean>(false);
    currentThemeSig = signal<'light' | 'dark'>('light');

    // 2. Setup Spies/Mocks
    authServiceMock = { currentUser: currentUserSig };
    notificationStateMock = { hasUnreadNotifications: hasUnreadSig };
    themeServiceMock = { currentTheme: currentThemeSig };
    responsiveServiceMock = { isMobile$: of(false) };

    await TestBed.configureTestingModule({
      imports: [Header], // Componente real
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authServiceMock },
        { provide: NotificationState, useValue: notificationStateMock },
        { provide: Theme, useValue: themeServiceMock },
        { provide: Responsive, useValue: responsiveServiceMock },
      ],
    })
      .overrideComponent(Header, {
        remove: { imports: [Menu, SearchBar] },
        add: { imports: [MockMenu, MockSearchBar] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering & Signals', () => {
    it('should compute logoPath based on theme signal', () => {
      // Light Mode (Default)
      expect(component.logoPath()).toContain('logo-small.webp');

      // Dark Mode
      currentThemeSig.set('dark');
      fixture.detectChanges();
      expect(component.logoPath()).toContain('logo-small-dark-theme.webp');
    });

    it('should show user avatar when logged in', () => {
      currentUserSig.set(mockUser);
      fixture.detectChanges();

      const avatar = fixture.debugElement.query(By.css('.header__user-avatar'));
      expect(avatar).toBeTruthy();
      expect(avatar.nativeElement.src).toContain('avatar.com/img.png');
    });

    it('should show account icon when logged out', () => {
      currentUserSig.set(null);
      fixture.detectChanges();

      const accountIcon = fixture.debugElement.query(By.css('mat-icon'));
      // Buscamos el icono genérico en la sección derecha
      const rightSection = fixture.debugElement.query(By.css('.header__section--right'));
      expect(rightSection.nativeElement.textContent).toContain('account_circle');
    });

    it('should apply "no-shadow" class based on input signal', () => {
      // Default false
      const toolbar = fixture.debugElement.query(By.css('mat-toolbar'));
      expect(toolbar.classes['no-shadow']).toBeFalsy();

      // Set input true
      fixture.componentRef.setInput('disableShadow', true);
      fixture.detectChanges();

      expect(toolbar.classes['no-shadow']).toBeTrue();
    });

    it('should show notification dot if unread notifications exist', () => {
      hasUnreadSig.set(true);
      fixture.detectChanges();

      const dot = fixture.debugElement.query(By.css('.notification-dot'));
      expect(dot).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should toggle menu component on button click', () => {
      // 1. Obtenemos la instancia del Mock que Angular inyectó gracias al provider
      const mockMenuInstance = component.menuComponent();

      // 2. Espiamos el método toggle de esa instancia
      const toggleSpy = spyOn(mockMenuInstance, 'toggle');

      // 3. Click en el botón
      const menuBtn = fixture.debugElement.query(By.css('button[aria-label="Abrir menú"]'));
      menuBtn.nativeElement.click();

      // 4. Verificación
      expect(toggleSpy).toHaveBeenCalled();
    });
  });
});
