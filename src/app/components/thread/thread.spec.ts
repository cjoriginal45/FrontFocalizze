import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Thread } from './thread';
import { signal, NO_ERRORS_SCHEMA, WritableSignal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

// Interfaces
import { FeedThreadDto } from '../../interfaces/FeedThread';
import { UserInterface } from '../../interfaces/UserInterface';

// Mocks de servicios
import { Like } from '../../services/likeService/like';
import { Interaction } from '../../services/interactionService/interaction';
import { threadService } from '../../services/thread/thread';
import { Save } from '../../services/saveService/save';
import { ThreadState } from '../../services/thread-state/thread-state';
import { UserState } from '../../services/user-state/user-state';
import { Auth } from '../../services/auth/auth';
import { ViewTracking } from '../../services/viewTracking/view-tracking';
import { Block } from '../../services/block/block';
import { Search } from '../../services/search/search';

describe('Thread Component', () => {
  let component: Thread;
  let fixture: ComponentFixture<Thread>;

  let threadStateSpy: jasmine.SpyObj<ThreadState>;
  let threadServiceSpy: jasmine.SpyObj<threadService>;
  let likeServiceSpy: jasmine.SpyObj<Like>;
  let userStateSpy: jasmine.SpyObj<UserState>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let authServiceMock: any; // Usamos mock manual para Auth

  const mockUser: UserInterface = {
    id: 101,
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: 'url/to/avatar',
    isFollowing: false,
    followingCount: 10,
    followersCount: 20,
    isBlocked: false,
  };

  const mockThreadData: FeedThreadDto = {
    id: 1,
    user: mockUser,
    publicationDate: new Date().toISOString(),
    posts: ['Contenido del hilo'],
    stats: { likes: 10, comments: 5, views: 100, saves: 1 },
    isLiked: false,
    isSaved: false,
    categoryName: 'Tech',
    images: [],
  };

  beforeEach(async () => {
    threadStateSpy = jasmine.createSpyObj('ThreadState', [
      'getThreadSignal',
      'updateLikeState',
      'updateThreadData',
      'removeThread',
      'removeThreadsByAuthor',
    ]);
    threadServiceSpy = jasmine.createSpyObj('threadService', [
      'getThreadById',
      'updateThread',
      'deleteThread',
    ]);
    likeServiceSpy = jasmine.createSpyObj('Like', ['toggleLike']);
    userStateSpy = jasmine.createSpyObj('UserState', ['getUserSignal', 'updateBlockedState']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    // --- SOLUCIÓN ERROR getCurrentUser ---
    authServiceMock = {
      isAuthenticated: () => true,
      getCurrentUser: () => mockUser, // Devolvemos el usuario mock para el HTML
    };

    await TestBed.configureTestingModule({
      imports: [Thread, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ThreadState, useValue: threadStateSpy },
        { provide: threadService, useValue: threadServiceSpy },
        { provide: Like, useValue: likeServiceSpy },
        { provide: UserState, useValue: userStateSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Auth, useValue: authServiceMock },
        {
          provide: Interaction,
          useValue: jasmine.createSpyObj('Interaction', ['notifyLikeToggled', 'notifySaveToggled']),
        },
        { provide: Save, useValue: jasmine.createSpyObj('Save', ['toggleSave']) },
        { provide: ViewTracking, useValue: { hasBeenViewed: () => false, markAsViewed: () => {} } },
        { provide: Block, useValue: jasmine.createSpyObj('Block', ['toggleBlock']) },
        { provide: Search, useValue: {} },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: ActivatedRoute, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Thread);
    component = fixture.componentInstance;

    // Seteamos una señal por defecto para evitar errores de renderizado inicial
    threadStateSpy.getThreadSignal.and.returnValue(signal(mockThreadData) as any);
    userStateSpy.getUserSignal.and.returnValue(signal(mockUser) as any);
  });

  it('debería crearse el componente correctamente', () => {
    component.threadId = 1;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Acciones de Usuario', () => {
    beforeEach(() => {
      component.threadId = 1; // Asignar el ID asegura que el setter corra
      fixture.detectChanges();
    });

    it('debería ejecutar toggleLike y actualizar el estado', () => {
      likeServiceSpy.toggleLike.and.returnValue(of(undefined));
      component.toggleLike();
      expect(threadStateSpy.updateLikeState).toHaveBeenCalledWith(1, true, 11);
    });

    it('debería emitir openComments con los datos del hilo', () => {
      spyOn(component.openComments, 'emit');
      component.onCommentClick();
      expect(component.openComments.emit).toHaveBeenCalledWith({
        threadId: 1,
        username: 'testuser',
      });
    });
  });

  describe('Borrado de Hilo', () => {
    it('debería eliminar el hilo tras confirmación del diálogo', () => {
      // Forzamos el ID y la señal para que el método tenga de donde leer this.threadId
      component.threadId = 1;
      component.threadSignal.set(mockThreadData);

      dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);
      threadServiceSpy.deleteThread.and.returnValue(of(undefined));

      component.openDeleteConfirm();

      expect(threadServiceSpy.deleteThread).toHaveBeenCalledWith(1);
      expect(threadStateSpy.removeThread).toHaveBeenCalledWith(1);
    });
  });
});
