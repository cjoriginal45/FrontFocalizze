import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Menu } from './menu';
import { Auth, AuthUser } from '../../services/auth/auth';
import { Theme } from '../../services/themeService/theme';
import { provideRouter } from '@angular/router';
import { signal, WritableSignal, Component, Input, forwardRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

// Imports necesarios solo para utilizarlos como tokens en la Inyección de Dependencias (DI)
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';

// --- MOCKS DE COMPONENTES (Material Isolation) ---
// Se definen mocks ligeros para aislar el componente bajo prueba y evitar dependencias
// complejas del entorno (como el sistema de animaciones o módulos externos).

@Component({
  selector: 'mat-sidenav',
  template: '<ng-content></ng-content>',
  standalone: true,
  providers: [
    // Configuración de DI: Permite que 'viewChild(MatSidenav)' resuelva este Mock
    // en lugar de buscar la instancia original, manteniendo el tipado seguro.
    { provide: MatSidenav, useExisting: forwardRef(() => MockMatSidenav) },
  ],
})
class MockMatSidenav {
  @Input() mode: any;
  @Input() opened: boolean = false;

  // Spies para verificar interacciones sin ejecutar lógica real
  toggle = jasmine.createSpy('toggle');
  close = jasmine.createSpy('close');
}

@Component({
  selector: 'mat-sidenav-container',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatSidenavContainer {}

@Component({
  selector: 'mat-sidenav-content',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatSidenavContent {}

@Component({
  selector: 'mat-nav-list',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatNavList {}

@Component({
  selector: 'mat-icon',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatIcon {}

// --- TEST SUITE ---

describe('Menu Component', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let authServiceMock: jasmine.SpyObj<Auth>;
  let themeServiceMock: jasmine.SpyObj<Theme>;

  // Signals para control reactivo del estado en los tests
  let currentUserSignal: WritableSignal<AuthUser | null>;
  let currentThemeSignal: WritableSignal<'light' | 'dark'>;

  const mockUser: AuthUser = {
    id: 1,
    username: 'testuser',
    displayName: 'Test User',
    followingCount: 10,
    followersCount: 20,
    role: 'USER',
    dailyInteractionsRemaining: 5,
    avatarUrl: 'http://avatar.url',
  };

  beforeEach(async () => {
    // Inicialización de estados reactivos
    currentUserSignal = signal<AuthUser | null>(null);
    currentThemeSignal = signal<'light' | 'dark'>('light');

    // Configuración de Spies
    authServiceMock = jasmine.createSpyObj('Auth', ['logout'], {
      currentUser: currentUserSignal,
    });

    themeServiceMock = jasmine.createSpyObj('Theme', [], {
      currentTheme: currentThemeSignal,
    });

    await TestBed.configureTestingModule({
      imports: [Menu, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authServiceMock },
        { provide: Theme, useValue: themeServiceMock },
      ],
    })
      // Component Overrides:
      // Reemplaza los componentes reales de Material por los Mocks definidos arriba.
      // Esto garantiza un test unitario puro, libre de efectos secundarios de librerías de UI.
      .overrideComponent(Menu, {
        remove: {
          imports: [MatSidenav, MatSidenavContainer, MatSidenavContent, MatNavList, MatIcon],
        },
        add: {
          imports: [
            MockMatSidenav,
            MockMatSidenavContainer,
            MockMatSidenavContent,
            MockMatNavList,
            MockMatIcon,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;

    // Inicialización de Inputs requeridos
    fixture.componentRef.setInput('isMobile$', of(false));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization & Rendering', () => {
    it('should have access to MatSidenav via viewChild (Mocked)', () => {
      // Verifica que el viewChild resuelva correctamente a nuestra instancia mockeada
      expect(component.matSidenav()).toBeTruthy();
      expect(component.matSidenav().toggle).toBeDefined();
    });

    it('should compute logoPath correctly based on theme', () => {
      expect(component.logoPath()).toContain('focalizze-logo-small.webp');

      // Simula cambio de tema reactivo
      currentThemeSignal.set('dark');
      fixture.detectChanges();

      expect(component.logoPath()).toContain('focalizze-logo-small-dark-theme.webp');
    });
  });

  describe('User State Rendering', () => {
    it('should show anonymous view when no user is logged in', () => {
      currentUserSignal.set(null);
      fixture.detectChanges();

      const anonymousView = fixture.debugElement.query(By.css('.sidenav__anonymous-view'));
      const userProfile = fixture.debugElement.query(By.css('.sidenav__user-profile'));

      expect(anonymousView).toBeTruthy();
      expect(userProfile).toBeFalsy();
    });

    it('should show user profile when user is logged in (Desktop)', () => {
      fixture.componentRef.setInput('isMobile$', of(false));
      currentUserSignal.set(mockUser);
      fixture.detectChanges();

      const anonymousView = fixture.debugElement.query(By.css('.sidenav__anonymous-view'));
      const userProfile = fixture.debugElement.query(By.css('.sidenav__desktop'));

      expect(anonymousView).toBeFalsy();
      expect(userProfile).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('toggle() should call toggle on the mocked sidenav', () => {
      // Casteo seguro al Mock para acceder a los métodos espiados
      const mockSidenav = component.matSidenav() as unknown as MockMatSidenav;

      component.toggle();

      expect(mockSidenav.toggle).toHaveBeenCalled();
    });

    it('logout() should call authService.logout and close sidenav', () => {
      const mockSidenav = component.matSidenav() as unknown as MockMatSidenav;

      component.logout();

      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(mockSidenav.close).toHaveBeenCalled();
    });

    it('clicking close button should close sidenav', () => {
      currentUserSignal.set(null);
      fixture.detectChanges();

      const closeBtn = fixture.debugElement.query(By.css('.sidenav__close-button'));
      const mockSidenav = component.matSidenav() as unknown as MockMatSidenav;

      closeBtn.nativeElement.click();

      expect(mockSidenav.close).toHaveBeenCalled();
    });
  });
});
