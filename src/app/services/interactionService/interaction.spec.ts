import { TestBed } from '@angular/core/testing';

import { InteractionCounter } from '../interactionCounter/interaction-counter';
import { Interaction } from './interaction';

describe('Interaction Service', () => {
  let service: Interaction;
  let interactionCounterSpy: jasmine.SpyObj<InteractionCounter>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('InteractionCounter', ['decrementCount', 'incrementCount']);

    TestBed.configureTestingModule({
      providers: [
        Interaction,
        { provide: InteractionCounter, useValue: spy }
      ]
    });

    service = TestBed.inject(Interaction);
    interactionCounterSpy = TestBed.inject(InteractionCounter) as jasmine.SpyObj<InteractionCounter>;
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('notifyCommentAdded', () => {
    it('debería emitir a través de commentAdded$ y llamar a decrementCount', (done: DoneFn) => {
      const threadId = 123;

      // 1. Nos suscribimos para validar la emisión
      service.commentAdded$.subscribe((event) => {
        expect(event.threadId).toBe(threadId);
        // No verificamos el spy aquí dentro para evitar problemas de orden de ejecución
      });

      // 2. Ejecutamos la acción (esto corre todo el método del servicio)
      service.notifyCommentAdded(threadId);

      // 3. Verificamos el spy DESPUÉS de que el método terminó
      expect(interactionCounterSpy.decrementCount).toHaveBeenCalled();
      done();
    });
  });

  describe('notifyLikeToggled', () => {
    it('debería emitir a través de likeToggled$ y llamar a decrementCount si isLiked es true', (done: DoneFn) => {
      const threadId = 456;
      const isLiked = true;

      service.likeToggled$.subscribe((event) => {
        expect(event.isLiked).toBeTrue();
      });

      service.notifyLikeToggled(threadId, isLiked);

      // Verificamos fuera de la suscripción
      expect(interactionCounterSpy.decrementCount).toHaveBeenCalled();
      expect(interactionCounterSpy.incrementCount).not.toHaveBeenCalled();
      done();
    });

    it('debería emitir a través de likeToggled$ y llamar a incrementCount si isLiked es false', (done: DoneFn) => {
      const threadId = 456;
      const isLiked = false;

      service.likeToggled$.subscribe((event) => {
        expect(event.isLiked).toBeFalse();
      });

      service.notifyLikeToggled(threadId, isLiked);

      // Verificamos fuera de la suscripción
      expect(interactionCounterSpy.incrementCount).toHaveBeenCalled();
      expect(interactionCounterSpy.decrementCount).not.toHaveBeenCalled();
      done();
    });
  });

  // Los demás tests (Save y Delete) no usan el spy, así que pueden quedar igual 
  // pero los ajustamos por consistencia
  describe('notifySaveToggled', () => {
    it('debería emitir a través de saveToggled$ con los datos correctos', (done: DoneFn) => {
      const threadId = 789;
      const isSaved = true;

      service.saveToggled$.subscribe((event) => {
        expect(event.threadId).toBe(threadId);
        expect(event.isSaved).toBe(isSaved);
        done();
      });

      service.notifySaveToggled(threadId, isSaved);
    });
  });

  describe('notifyCommentDeleted', () => {
    it('debería emitir a través de commentDeleted$ con el threadId correcto', (done: DoneFn) => {
      const threadId = 999;

      service.commentDeleted$.subscribe((event) => {
        expect(event.threadId).toBe(threadId);
        done();
      });

      service.notifyCommentDeleted(threadId);
    });
  });
});