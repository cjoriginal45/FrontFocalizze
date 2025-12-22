import { TestBed } from '@angular/core/testing';
import { ThreadState } from './thread-state';
import { Interaction } from '../interactionService/interaction';
import { Subject } from 'rxjs';
import { FeedThreadDto } from '../../interfaces/FeedThread';

describe('ThreadState', () => {
  let service: ThreadState;
  let interactionMock: any;

  // Sujetos para simular el InteractionService
  const commentAdded$ = new Subject<{ threadId: number }>();
  const saveToggled$ = new Subject<{ threadId: number; isSaved: boolean }>();
  const commentDeleted$ = new Subject<{ threadId: number }>();

  // Función de ayuda para crear hilos basados en tu interfaz real
  const createMockThread = (id: number): FeedThreadDto => ({
    id,
    user: {
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: '',
      isBlocked: false,
    } as any, // UserInterface simplificado para el test
    publicationDate: new Date().toISOString(),
    posts: ['Primer post del hilo'],
    stats: {
      likes: 0,
      saves: 0,
      comments: 0,
      views: 0,
    },
    isLiked: false,
    isSaved: false,
    categoryName: 'General',
    images: [],
  });

  beforeEach(() => {
    interactionMock = {
      commentAdded$,
      saveToggled$,
      commentDeleted$,
    };

    TestBed.configureTestingModule({
      providers: [ThreadState, { provide: Interaction, useValue: interactionMock }],
    });

    service = TestBed.inject(ThreadState);
  });

  it('debería crearse correctamente el servicio de estado', () => {
    expect(service).toBeTruthy();
  });

  describe('Sincronización con InteractionService', () => {
    it('debería reaccionar a commentAdded$ incrementando el contador', () => {
      const thread = createMockThread(1);
      service.loadThreads([thread]);

      commentAdded$.next({ threadId: 1 });

      const updatedThread = service.getThreadSignal(1)!();
      expect(updatedThread.stats.comments).toBe(1);
    });

    it('debería reaccionar a saveToggled$ actualizando isSaved y el conteo', () => {
      const thread = createMockThread(1);
      service.loadThreads([thread]);

      saveToggled$.next({ threadId: 1, isSaved: true });

      const updatedThread = service.getThreadSignal(1)!();
      expect(updatedThread.isSaved).toBeTrue();
      expect(updatedThread.stats.saves).toBe(1);
    });
  });

  describe('Operaciones de Estado Manuales', () => {
    it('debería actualizar el estado de Like mediante updateLikeState', () => {
      service.loadThreads([createMockThread(1)]);

      service.updateLikeState(1, true, 50);

      const thread = service.getThreadSignal(1)!();
      expect(thread.isLiked).toBeTrue();
      expect(thread.stats.likes).toBe(50);
    });

    it('debería fusionar datos correctamente en updateThreadData', () => {
      service.loadThreads([createMockThread(1)]);
      const freshData = createMockThread(1);
      freshData.posts = ['Post actualizado'];

      service.updateThreadData(1, freshData);

      expect(service.getThreadSignal(1)!().posts[0]).toBe('Post actualizado');
    });
  });

  describe('Ciclo de Vida de los Datos', () => {
    it('debería eliminar un hilo específico del mapa', () => {
      service.loadThreads([createMockThread(1)]);
      service.removeThread(1);
      expect(service.getThreadSignal(1)).toBeUndefined();
    });

    it('debería limpiar todo el almacenamiento al llamar a clearState', () => {
      service.loadThreads([createMockThread(1), createMockThread(2)]);
      service.clearState();
      expect(service.getThreadSignal(1)).toBeUndefined();
      expect(service.getThreadSignal(2)).toBeUndefined();
    });
  });
});
