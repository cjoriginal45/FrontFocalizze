import { TestBed } from '@angular/core/testing';
import { Responsive } from './responsive';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Subject } from 'rxjs';

describe('Responsive Service', () => {
  let service: Responsive;
  let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

  // Subject utilizado para simular el flujo de emisiones del BreakpointObserver.
  // Permite disparar cambios de resolución manualmente durante las pruebas.
  let breakpointSubject: Subject<BreakpointState>;

  beforeEach(() => {
    breakpointSubject = new Subject<BreakpointState>();

    const spy = jasmine.createSpyObj('BreakpointObserver', ['observe']);

    // Configuración del Spy: Redirigimos la llamada 'observe' a nuestro Subject controlable
    spy.observe.and.returnValue(breakpointSubject.asObservable());

    TestBed.configureTestingModule({
      providers: [Responsive, { provide: BreakpointObserver, useValue: spy }],
    });

    service = TestBed.inject(Responsive);
    breakpointObserverSpy = TestBed.inject(
      BreakpointObserver
    ) as jasmine.SpyObj<BreakpointObserver>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call observe with Breakpoints.Handset upon initialization', () => {
    expect(breakpointObserverSpy.observe).toHaveBeenCalledWith([Breakpoints.Handset]);
  });

  it('isMobile$ should emit "true" when breakpoint matches (Mobile View)', (done) => {
    service.isMobile$.subscribe((isMobile) => {
      expect(isMobile).toBeTrue();
      done();
    });

    // Simula un cambio de viewport a tamaño móvil
    breakpointSubject.next({
      matches: true,
      breakpoints: { [Breakpoints.Handset]: true },
    });
  });

  it('isMobile$ should emit "false" when breakpoint does not match (Desktop View)', (done) => {
    service.isMobile$.subscribe((isMobile) => {
      expect(isMobile).toBeFalse();
      done();
    });

    // Simula un cambio de viewport a tamaño escritorio
    breakpointSubject.next({
      matches: false,
      breakpoints: { [Breakpoints.Handset]: false },
    });
  });

  it('should handle shareReplay behavior (emit last value to new subscribers)', () => {
    // 1. Activación del Stream: Se requiere una suscripción inicial para que
    // el operador 'shareReplay' comience a escuchar y cachear la emisión.
    const initialSubscription = service.isMobile$.subscribe();

    // 2. Emisión: El Subject emite el valor mientras el stream está activo.
    breakpointSubject.next({ matches: true, breakpoints: {} });

    // 3. Suscripción Tardía: Simulamos un componente que se suscribe después
    // de que el evento de redimensionamiento ya ocurrió.
    let lateSubscriberValue: boolean | undefined;
    service.isMobile$.subscribe((val) => (lateSubscriberValue = val));

    // 4. Verificación: El suscriptor tardío debe recibir el valor cacheado inmediatamente.
    expect(lateSubscriberValue).toBeTrue();

    initialSubscription.unsubscribe();
  });
});
