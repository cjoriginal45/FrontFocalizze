import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { Auth, AuthUser } from './auth'; 
import { environment } from '../../environments/environment';
import { UserService } from '../user/user-service';
import { ViewTracking } from '../viewTracking/view-tracking';
import { ThreadState } from '../thread-state/thread-state';
import { UserState } from '../user-state/user-state';
import { CategoryState } from '../category-state/category-state';
import { NotificationState } from '../notification-state/notification-state';
import { InteractionCounter } from '../interactionCounter/interaction-counter';
import { Theme } from '../themeService/theme';

describe('Auth Service', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  let routerSpy: jasmine.SpyObj<Router>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let viewTrackingSpy: jasmine.SpyObj<ViewTracking>;
  let threadStateSpy: jasmine.SpyObj<ThreadState>;
  let userStateSpy: jasmine.SpyObj<UserState>;
  let categoryStateSpy: jasmine.SpyObj<CategoryState>;
  let notificationStateSpy: jasmine.SpyObj<NotificationState>;
  let interactionCounterSpy: jasmine.SpyObj<InteractionCounter>;
  let themeSpy: jasmine.SpyObj<Theme>;

  const VALID_DUMMY_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6OTk5OTk5OTk5OSwiaXNUd29GYWN0b3JFbmFibGVkIjp0cnVlfQ.signature';

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getMe', 'getInteractionStatus']);
    viewTrackingSpy = jasmine.createSpyObj('ViewTracking', ['clearViewedThreads']);
    threadStateSpy = jasmine.createSpyObj('ThreadState', ['clearState']);
    userStateSpy = jasmine.createSpyObj('UserState', ['clearState']);
    categoryStateSpy = jasmine.createSpyObj('CategoryState', ['clearState']);
    notificationStateSpy = jasmine.createSpyObj('NotificationState', ['initialize', 'clear']);
    interactionCounterSpy = jasmine.createSpyObj('InteractionCounter', ['incrementCount']);
    themeSpy = jasmine.createSpyObj('Theme', ['syncWithUserDto']);

    userServiceSpy.getMe.and.returnValue(of({ username: 'testuser', backgroundType: 'COLOR', backgroundValue: '#000' } as any));
    userServiceSpy.getInteractionStatus.and.returnValue(of({ remaining: 10, limit: 20 }));

    TestBed.configureTestingModule({
      providers: [
        Auth,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ViewTracking, useValue: viewTrackingSpy },
        { provide: ThreadState, useValue: threadStateSpy },
        { provide: UserState, useValue: userStateSpy },
        { provide: CategoryState, useValue: categoryStateSpy },
        { provide: NotificationState, useValue: notificationStateSpy },
        { provide: InteractionCounter, useValue: interactionCounterSpy },
        { provide: Theme, useValue: themeSpy }
      ]
    });

    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería instanciarse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('Carga Inicial (loadUserFromToken)', () => {
    it('debería cargar datos completos y sincronizar tema si el token es válido', fakeAsync(() => {
      localStorage.setItem('jwt_token', VALID_DUMMY_JWT);
      const mockUserRes = { username: 'testuser', backgroundType: 'IMAGE', backgroundValue: 'bg.jpg' };
      userServiceSpy.getMe.and.returnValue(of(mockUserRes as any));

      service.loadUserFromToken();
      tick();

      expect(themeSpy.syncWithUserDto).toHaveBeenCalledWith('IMAGE', 'bg.jpg');
      expect(service.authReady()).toBeTrue();
    }));

    it('debería marcar authReady aunque no exista token previo', async () => {
      localStorage.removeItem('jwt_token');
      await service.loadUserFromToken();
      expect(service.authReady()).toBeTrue();
    });
  });

  describe('Logout y Estados', () => {
    it('logout debería limpiar localstorage y estados', () => {
      service.currentUser.set({ username: 'user' } as AuthUser);
      service.logout();

      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(notificationStateSpy.clear).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Efectos Secundarios', () => {
    /**
     * TEST CLAVE: Para que el efecto se dispare, el valor debe CAMBIAR.
     * Luego usamos flushEffects() para procesar la cola de efectos de Angular.
     */
    it('debería limpiar el estado de la app automáticamente cuando el usuario pasa a null', () => {
      // 1. Seteamos un usuario (Estado inicial distinto de null)
      service.currentUser.set({ username: 'test' } as AuthUser);
      
      // 2. Reseteamos los spies para ignorar cualquier llamada ocurrida en el constructor
      threadStateSpy.clearState.calls.reset();
      userStateSpy.clearState.calls.reset();
      categoryStateSpy.clearState.calls.reset();

      // 3. Cambiamos a null para disparar la lógica del effect()
      service.currentUser.set(null);

      // 4. Forzamos la ejecución de los efectos pendientes en Angular 17.2/20
      TestBed.flushEffects();

      // 5. Assert
      expect(threadStateSpy.clearState).withContext('ThreadState debería limpiarse').toHaveBeenCalled();
      expect(userStateSpy.clearState).withContext('UserState debería limpiarse').toHaveBeenCalled();
      expect(categoryStateSpy.clearState).withContext('CategoryState debería limpiarse').toHaveBeenCalled();
    });
  });
});