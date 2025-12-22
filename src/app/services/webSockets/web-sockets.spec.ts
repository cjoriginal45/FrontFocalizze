import { TestBed } from '@angular/core/testing';
import { WebSockets } from './web-sockets';
import { Client, IFrame, IMessage } from '@stomp/stompjs';

describe('WebSockets', () => {
  let service: WebSockets;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [WebSockets],
    });
    service = TestBed.inject(WebSockets);
  });

  it('debería crearse correctamente el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('Conexión y Suscripción', () => {
    beforeEach(() => {
      localStorage.setItem('jwt_token', 'test-token');
    });

    it('debería emitir una notificación cuando se recibe un mensaje por el socket', (done) => {
      // 1. Mockeamos el método subscribe
      const subscribeSpy = spyOn(Client.prototype, 'subscribe').and.callFake(
        (topic: string, callback: (message: IMessage) => void) => {
          // Simulamos la llegada del mensaje después de un pequeño delay
          setTimeout(() => {
            callback({
              body: JSON.stringify({ id: 1, message: 'Test Notif' }),
              ack: () => {},
              nack: () => {},
              headers: {},
              command: 'MESSAGE',
              isBinaryBody: false,
              binaryBody: new Uint8Array(),
            } as IMessage);
          });
          return { id: 'sub-0', unsubscribe: () => {} };
        }
      );

      // 2. Mockeamos activate para forzar el onConnect
      spyOn(Client.prototype, 'activate').and.callFake(() => {
        const client = (service as any).stompClient as Client;
        if (client && client.onConnect) {
          // Creamos un mock de IFrame que cumpla con la interfaz requerida por TS
          const mockFrame: IFrame = {
            command: 'CONNECTED',
            headers: {},
            isBinaryBody: false,
            body: '',
            binaryBody: new Uint8Array(),
          };
          client.onConnect(mockFrame);
        }
      });

      // 3. Verificamos la emisión
      service.notification$.subscribe((notif) => {
        expect(notif.message).toBe('Test Notif');
        expect(subscribeSpy).toHaveBeenCalledWith(
          '/user/queue/notifications',
          jasmine.any(Function)
        );
        done();
      });

      service.connect();
    });
  });

  describe('Desconexión', () => {
    it('debería desactivar el cliente al llamar a disconnect', () => {
      localStorage.setItem('jwt_token', 'token');

      spyOn(Client.prototype, 'activate');
      service.connect();

      const stompClient = (service as any).stompClient;
      // Mockeamos la propiedad 'active'
      spyOnProperty(stompClient, 'active', 'get').and.returnValue(true);
      const spyDeactivate = spyOn(stompClient, 'deactivate');

      service.disconnect();

      expect(spyDeactivate).toHaveBeenCalled();
      expect((service as any).stompClient).toBeNull();
    });
  });
});
