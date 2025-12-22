import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { WebSockets } from '../webSockets/web-sockets';
import { Notification } from '../notification/notification';
import { NotificationState } from './notification-state';

describe('NotificationState', () => {
  let service: NotificationState;
  
  // Spies con mocks tipados
  let webSocketSpy: jasmine.SpyObj<WebSockets>;
  let notificationApiSpy: jasmine.SpyObj<Notification>;
  
  // Subject para simular el stream del WebSocket
  let notificationSubject: Subject<any>;

  beforeEach(() => {
    notificationSubject = new Subject();
    
    // Configuración de Spies
    webSocketSpy = jasmine.createSpyObj('WebSockets', ['connect', 'disconnect'], {
      notification$: notificationSubject.asObservable()
    });
    
    notificationApiSpy = jasmine.createSpyObj('Notification', ['checkUnread', 'markAllAsRead']);

    TestBed.configureTestingModule({
      providers: [
        NotificationState,
        { provide: WebSockets, useValue: webSocketSpy },
        { provide: Notification, useValue: notificationApiSpy }
      ]
    });

    service = TestBed.inject(NotificationState);
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize()', () => {
    it('debería conectar el socket y verificar notificaciones no leídas', () => {
      // Arrange
      notificationApiSpy.checkUnread.and.returnValue(of({ hasUnread: true }));

      // Act
      service.initialize();

      // Assert
      expect(webSocketSpy.connect).toHaveBeenCalled();
      expect(notificationApiSpy.checkUnread).toHaveBeenCalled();
      expect(service.hasUnreadNotifications()).toBeTrue();
    });

    it('debería actualizar la señal a true cuando llega un mensaje por WebSocket', () => {
      // Arrange
      notificationApiSpy.checkUnread.and.returnValue(of({ hasUnread: false }));
      service.initialize();
      expect(service.hasUnreadNotifications()).toBeFalse();

      // Act: Emitimos nueva notificación por el socket
      notificationSubject.next({ message: 'new' });

      // Assert
      expect(service.hasUnreadNotifications()).toBeTrue();
    });
  });

  describe('markAllAsRead()', () => {
    it('debería realizar actualización optimista y llamar a la API', () => {
      // Arrange
      service.hasUnreadNotifications.set(true);
      notificationApiSpy.markAllAsRead.and.returnValue(of(void 0));

      // Act
      service.markAllAsRead();

      // Assert
      expect(service.hasUnreadNotifications()).toBeFalse(); // Optimista
      expect(notificationApiSpy.markAllAsRead).toHaveBeenCalled();
    });

    it('debería revertir el estado a true si la llamada a la API falla', () => {
      // Arrange
      service.hasUnreadNotifications.set(true);
      notificationApiSpy.markAllAsRead.and.returnValue(throwError(() => new Error('API Error')));

      // Act
      service.markAllAsRead();

      // Assert
      expect(service.hasUnreadNotifications()).toBeTrue(); // Revertido
    });
  });

  describe('clear()', () => {
    it('debería desconectar el socket y resetear la señal', () => {
      // Arrange
      service.hasUnreadNotifications.set(true);
      
      // Act
      service.clear();

      // Assert
      expect(webSocketSpy.disconnect).toHaveBeenCalled();
      expect(service.hasUnreadNotifications()).toBeFalse();
    });
  });
});