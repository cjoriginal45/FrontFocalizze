import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Theme, ThemeConfig } from './theme';

describe('Theme Service', () => {
  let httpMock: HttpTestingController;

  const API_URL = `${environment.apiBaseUrl}/users/me/theme`;

  /**
   * Mock para window.matchMedia
   * Es vital definirlo antes de que se instancie el servicio.
   */
  const setupMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jasmine.createSpy().and.returnValue({
        matches,
        media: '',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  };

  /**
   * Mock para LocalStorage
   * Permite manipular 'getItem' antes de crear el servicio.
   */
  let store: { [key: string]: string } = {};

  const setupLocalStorage = () => {
    store = {};

    spyOn(localStorage, 'getItem').and.callFake((key) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      store[key] = value + '';
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  };

  beforeEach(() => {
    setupMatchMedia(false); // Default: Light mode
    setupLocalStorage();

    TestBed.configureTestingModule({
      providers: [
        Theme,
        // Angular 18/19/20 Standard for HTTP Testing
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    // Inyectamos solo el controlador HTTP.
    // NO inyectamos el servicio 'Theme' aquí para poder manipular
    // el localStorage antes de que corra su constructor en cada test.
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Limpieza del DOM global
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.removeAttribute('style');

    // Verificación de peticiones pendientes
    httpMock.verify();
  });

  // --- TESTS DE INICIALIZACIÓN ---

  it('should be created and default to light theme (system preference)', () => {
    // Al inyectar aquí, corre el constructor
    const service = TestBed.inject(Theme);

    expect(service).toBeTruthy();
    expect(service.currentTheme()).toBe('light');

    // Trigger manual de efectos (Estándar en Services con Signals)
    TestBed.flushEffects();

    expect(document.body.classList.contains('light-theme')).toBeTrue();
  });

  it('should initialize from LocalStorage if config exists', () => {
    // 1. Arrange: Preparamos el storage ANTES de crear el servicio
    const storedConfig: ThemeConfig = {
      mode: 'dark',
      bgType: 'color',
      bgValue: '#123456',
    };
    store['user-theme-config'] = JSON.stringify(storedConfig);

    // 2. Act: Inyectamos el servicio (el constructor leerá el mock de arriba)
    const service = TestBed.inject(Theme);

    // 3. Assert: Signals
    expect(service.currentTheme()).toBe('dark');
    expect(service.backgroundType()).toBe('color');
    expect(service.backgroundValue()).toBe('#123456');

    // 4. Assert: DOM
    TestBed.flushEffects();
    expect(document.body.classList.contains('dark-theme')).toBeTrue();
    expect(document.body.style.getPropertyValue('--background-color')).toBe('#123456');
  });

  // --- TESTS DE LÓGICA Y DOM ---

  describe('State Changes & Effects', () => {
    let service: Theme;

    beforeEach(() => {
      // Para este bloque, inyectamos el servicio normalmente (estado inicial limpio)
      service = TestBed.inject(Theme);
    });

    it('setThemeMode should update signal, DOM class, and LocalStorage', () => {
      service.setThemeMode('dark');
      TestBed.flushEffects();

      // Verificar Signal
      expect(service.currentTheme()).toBe('dark');

      // Verificar DOM
      expect(document.body.classList.contains('dark-theme')).toBeTrue();
      expect(document.body.classList.contains('light-theme')).toBeFalse();

      // Verificar Persistencia
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user-theme-config',
        jasmine.stringMatching(/"mode":"dark"/)
      );
    });

    it('setCustomBackground (color) should update DOM styles and call API', () => {
      service.setCustomBackground('color', '#ff0000');
      TestBed.flushEffects();

      // Verificar DOM
      const bodyStyle = document.body.style;
      expect(bodyStyle.getPropertyValue('--background-color')).toBe('#ff0000');
      expect(bodyStyle.backgroundImage).toBe('none');

      // Verificar API (Fire and forget)
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        backgroundType: 'color',
        backgroundValue: '#ff0000',
      });
      req.flush({});
    });

    it('setCustomBackground (image) should update DOM styles and call API', () => {
      const imgUrl = 'https://example.com/bg.jpg';
      service.setCustomBackground('image', imgUrl);
      TestBed.flushEffects();

      const bodyStyle = document.body.style;
      expect(bodyStyle.backgroundImage).toContain(`url("${imgUrl}")`);
      expect(bodyStyle.backgroundAttachment).toBe('fixed');

      const req = httpMock.expectOne(API_URL);
      req.flush({});
    });

    it('should clear styles when background type is default', () => {
      // 1. Establecer un fondo primero
      service.setCustomBackground('color', 'red');
      TestBed.flushEffects();
      httpMock.expectOne(API_URL).flush({});

      // 2. Volver a default
      service.setCustomBackground('default', null);
      TestBed.flushEffects();

      // 3. Verificar limpieza
      expect(document.body.style.getPropertyValue('--background-color')).toBe('');
      expect(document.body.style.backgroundImage).toBe('none');

      const req = httpMock.expectOne(API_URL);
      expect(req.request.body).toEqual({ backgroundType: 'default', backgroundValue: null });
      req.flush({});
    });

    it('syncWithUserDto should update signals without calling API', () => {
      service.syncWithUserDto('color', '#00ff00');
      TestBed.flushEffects();

      expect(service.backgroundType()).toBe('color');
      expect(service.backgroundValue()).toBe('#00ff00');

      // El efecto actualiza el DOM
      expect(document.body.style.getPropertyValue('--background-color')).toBe('#00ff00');

      // NO debe haber llamada a la API (sync es solo local)
      httpMock.expectNone(API_URL);
    });
  });
});
