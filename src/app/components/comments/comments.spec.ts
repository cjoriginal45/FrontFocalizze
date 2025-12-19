import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Comments, DialogData } from './comments';
import { Comment } from '../../services/commentService/comment';
import { Interaction } from '../../services/interactionService/interaction';
import { Auth } from '../../services/auth/auth';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CommentResponseDto } from '../../interfaces/CommentResponse';
import { UserInterface } from '../../interfaces/UserInterface';

describe('Comments', () => {
  let component: Comments;
  let fixture: ComponentFixture<Comments>;

  let commentServiceSpy: jasmine.SpyObj<Comment>;
  let interactionServiceSpy: jasmine.SpyObj<Interaction>;
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<Comments>>;

  const mockDialogData: DialogData = { threadId: 123, username: 'authorUser' };

  const mockAuthor: UserInterface = {
    id: 1,
    username: 'user1',
    displayName: 'User One',
    avatarUrl: 'assets/images/default-avatar.png',
    isFollowing: false,
    followingCount: 10,
    followersCount: 5,
    isBlocked: false,
    isTwoFactorEnabled: true,
    backgroundType: 'color',
    backgroundValue: '#ffffff',
  };

  const mockComment: CommentResponseDto = {
    id: 1,
    content: 'Test Comment',
    author: mockAuthor,
    createdAt: new Date().toISOString(),
    replies: [],
  };

  const mockPage = {
    content: [mockComment],
    totalElements: 1,
    totalPages: 1,
    last: true,
    size: 20,
    number: 0,
  };

  beforeEach(async () => {
    commentServiceSpy = jasmine.createSpyObj('Comment', [
      'getComments',
      'createComment',
      'deleteComment',
      'editComment',
      'replyToComment',
    ]);
    interactionServiceSpy = jasmine.createSpyObj('Interaction', [
      'notifyCommentAdded',
      'notifyCommentDeleted',
    ]);
    authServiceSpy = jasmine.createSpyObj('Auth', ['getCurrentUser'], {
      currentUser: signal({ ...mockAuthor, username: 'authorUser' }),
    });
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [Comments, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: Comment, useValue: commentServiceSpy },
        { provide: Interaction, useValue: interactionServiceSpy },
        { provide: Auth, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        // Aunque lo pongamos aquí, usaremos overrideComponent para mayor seguridad
        { provide: MatDialog, useValue: dialogSpy },
      ],
    })
      // ESTRATEGIA ARQUITECTÓNICA: Forzamos al componente standalone a usar nuestro Spy
      .overrideComponent(Comments, {
        set: {
          providers: [
            { provide: MatDialog, useValue: dialogSpy },
            { provide: Comment, useValue: commentServiceSpy },
            { provide: Interaction, useValue: interactionServiceSpy },
            { provide: Auth, useValue: authServiceSpy },
          ],
        },
      })
      .compileComponents();

    commentServiceSpy.getComments.and.returnValue(of(mockPage));

    fixture = TestBed.createComponent(Comments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load comments on init', () => {
    expect(component).toBeTruthy();
    expect(commentServiceSpy.getComments).toHaveBeenCalled();
  });

  it('should handle delete confirmation and update list optimistically', () => {
    // Arrange
    const dialogRefMock = { afterClosed: () => of(true) };
    dialogSpy.open.and.returnValue(dialogRefMock as any);
    commentServiceSpy.deleteComment.and.returnValue(of(void 0));

    // Act
    component.openDeleteConfirm(1);

    // Assert
    expect(dialogSpy.open)
      .withContext('Debería haberse llamado al spy de MatDialog')
      .toHaveBeenCalled();
    expect(component.comments().length)
      .withContext('La lista debería estar vacía tras borrar')
      .toBe(0);
  });

  it('should revert comments if delete fails', () => {
    // Arrange
    const dialogRefMock = { afterClosed: () => of(true) };
    dialogSpy.open.and.returnValue(dialogRefMock as any);
    commentServiceSpy.deleteComment.and.returnValue(throwError(() => new Error('API Error')));

    // Act
    component.openDeleteConfirm(1);

    // Assert
    expect(component.comments().length)
      .withContext('La lista debería restaurarse al fallar la API')
      .toBe(1);
  });

  it('should post a comment and update list', () => {
    const newContent = 'New amazing comment';
    component.commentControl.setValue(newContent);
    commentServiceSpy.createComment.and.returnValue(
      of({ ...mockComment, id: 2, content: newContent })
    );

    component.postComment();

    expect(component.comments().length).toBe(2);
    expect(component.comments()[0].content).toBe(newContent);
  });

  it('should send a reply and update the parent comment', () => {
    const replyContent = 'This is a reply';
    component.startReplying(1);
    component.replyControl.setValue(replyContent);
    commentServiceSpy.replyToComment.and.returnValue(
      of({ ...mockComment, id: 99, content: replyContent })
    );

    component.sendReply(1);

    const updatedParent = component.comments().find((c) => c.id === 1);
    expect(updatedParent?.replies?.length).toBe(1);
    expect(component.replyingToCommentId()).toBeNull();
  });
});
