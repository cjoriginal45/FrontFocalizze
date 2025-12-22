import { TestBed } from '@angular/core/testing';
import { ViewTracking } from './view-tracking';

describe('ViewTracking', () => {
  let service: ViewTracking;
  const STORAGE_KEY = 'focalizze_viewed_threads';

  beforeEach(() => {
    // Limpiamos sessionStorage antes de cada test
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [ViewTracking],
    });
    service = TestBed.inject(ViewTracking);
  });

  it('debería crearse correctamente el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('Gestión de vistas', () => {
    it('debería marcar un hilo como visto y guardarlo en storage', () => {
      const threadId = 123;
      service.markAsViewed(threadId);

      expect(service.hasBeenViewed(threadId)).toBeTrue();

      const stored = sessionStorage.getItem(STORAGE_KEY);
      expect(stored).toContain('123');
    });

    it('debería retornar false si un hilo no ha sido visto', () => {
      expect(service.hasBeenViewed(999)).toBeFalse();
    });

    it('debería cargar las vistas previas desde sessionStorage al inicializarse', () => {
      // 1. Preparamos el storage con datos
      const initialViews = [1, 2, 3];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initialViews));

      // 2. Creamos una nueva instancia del servicio para disparar el constructor
      const newService = new ViewTracking();

      expect(newService.hasBeenViewed(1)).toBeTrue();
      expect(newService.hasBeenViewed(2)).toBeTrue();
      expect(newService.hasBeenViewed(4)).toBeFalse();
    });
  });

  describe('Limpieza de datos', () => {
    it('debería limpiar el Set y el sessionStorage al llamar a clearViewedThreads', () => {
      service.markAsViewed(1);
      service.clearViewedThreads();

      expect(service.hasBeenViewed(1)).toBeFalse();
      expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
