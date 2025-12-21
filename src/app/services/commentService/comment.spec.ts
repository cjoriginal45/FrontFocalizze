import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { CommentResponseDto } from '../../interfaces/CommentResponse';
import { CommentRequestDto } from '../../interfaces/CommentRequest';
import { Comment } from './comment';

describe('Comment Service', () => {
  let service: Comment;
  let httpMock: HttpTestingController;
  const threadsApiUrl = `${environment.apiBaseUrl}/threads`;
  const commentsApiUrl = `${environment.apiBaseUrl}/comments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Comment,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(Comment);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería obtener comentarios de un hilo específico', () => {
    // Arrange
    const threadId = 1;
    service.getComments(threadId, 0, 5).subscribe();

    // Assert
    const req = httpMock.expectOne((r) => 
      r.url === `${threadsApiUrl}/${threadId}/comments` &&
      r.params.get('page') === '0'
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('debería crear un nuevo comentario', () => {
    // Arrange
    const threadId = 1;
    const content = 'Test Comment';

    // Act
    service.createComment(threadId, content).subscribe();

    // Assert
    const req = httpMock.expectOne(`${threadsApiUrl}/${threadId}/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content });
    req.flush({});
  });

  it('debería eliminar un comentario por ID', () => {
    // Arrange
    const commentId = 99;

    // Act
    service.deleteComment(commentId).subscribe();

    // Assert
    const req = httpMock.expectOne(`${commentsApiUrl}/${commentId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('debería editar un comentario usando PATCH', () => {
    // Arrange
    const commentId = 50;
    const updateDto: CommentRequestDto = { content: 'Updated content' };

    // Act
    service.editComment(commentId, updateDto).subscribe();

    // Assert
    const req = httpMock.expectOne(`${commentsApiUrl}/${commentId}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(updateDto);
    req.flush({});
  });

  it('debería enviar una respuesta a un comentario (replyToComment)', () => {
    // Arrange
    const parentId = 10;
    const replyContent = 'This is a reply';

    // Act
    service.replyToComment(parentId, replyContent).subscribe();

    // Assert
    const req = httpMock.expectOne(`${commentsApiUrl}/${parentId}/reply`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: replyContent });
    req.flush({});
  });

  it('debería manejar errores de red en la edición de comentarios', () => {
    // Act
    service.deleteComment(1).subscribe({
      next: () => fail('Debería haber fallado'),
      error: (error) => expect(error.status).toBe(403)
    });

    // Assert
    const req = httpMock.expectOne(`${commentsApiUrl}/1`);
    req.flush('No autorizado', { status: 403, statusText: 'Forbidden' });
  });
});