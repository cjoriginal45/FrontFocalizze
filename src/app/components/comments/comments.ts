import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Comment } from '../../services/commentService/comment';
import { CommentResponseDto } from '../../interfaces/CommentResponse';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Interaction } from '../../services/interactionService/interaction';
import { TimeAgoPipe } from '../../pipes/time-ago/time-ago-pipe';
import { Auth } from '../../services/auth/auth';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmMatDialog } from '../mat-dialog/mat-dialog/mat-dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CommentRequestDto } from '../../interfaces/CommentRequest';
import { EditCommentModal } from '../edit-comment-modal/edit-comment-modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Interfaz para la data que recibe el modal
// Interface for the data that the modal receives
export interface DialogData {
  threadId: number; 
  username: string;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    CdkTextareaAutosize,
    CommonModule,
    ReactiveFormsModule,
    TimeAgoPipe,
    MatMenuModule,
    TranslateModule
],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments {

    // --- Inyección de Dependencias ---
    private readonly commentService = inject(Comment);
    private readonly interactionService = inject(Interaction);
    public readonly authService = inject(Auth);
    private readonly dialog = inject(MatDialog);
    private readonly destroyRef = inject(DestroyRef);


    public readonly dialogRef = inject(MatDialogRef<Comments>);
    public readonly data: DialogData = inject(MAT_DIALOG_DATA);


      // --- Estado con Signals ---
    public readonly comments = signal<CommentResponseDto[]>([]);
    public readonly isLoading = signal<boolean>(false);
    public readonly replyingToCommentId = signal<number | null>(null);
    public readonly isThreadAuthor = signal<boolean>(false);


    // --- Formularios ---
  public readonly commentControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(280)]
  });

  public readonly replyControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(280)]
  });

  public readonly defaultAvatar = 'assets/images/default-avatar.png';


  // --- Ciclo de Vida del Componente ---
   ngOnInit(): void {
    this.checkThreadOwnership();
    this.loadComments();
  }

  private checkThreadOwnership(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.data.username) {
      this.isThreadAuthor.set(currentUser.username === this.data.username);
    }
  }

  // carga los comentarios iniciales
  loadComments(): void {
   this.isLoading.set(true);
    this.commentService.getComments(this.data.threadId, 0, 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.comments.set(page.content);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
  }

  // Publicar un nuevo comentario
  postComment(): void {
    if (this.commentControl.invalid) return;

    const content = this.commentControl.getRawValue();
    this.commentControl.disable();

    this.commentService.createComment(this.data.threadId, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newComment) => {
          this.comments.update(prev => [newComment, ...prev]);
          this.commentControl.reset();
          this.commentControl.enable();
          this.interactionService.notifyCommentAdded(this.data.threadId);
        },
        error: () => this.commentControl.enable()
      });
  }

  // Abrir diálogo de confirmación para eliminar comentario
  openDeleteConfirm(commentId: number): void {
    this.dialog.open(ConfirmMatDialog, {
      data: {
        title: '¿Eliminar Comentario?',
        message: 'Esta acción no se puede deshacer.',
      },
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (confirmed) this.deleteComment(commentId);
      });
  }

  // Eliminar comentario
  private deleteComment(commentId: number): void {
   // Eliminación optimista en el Signal
   const previousComments = this.comments();
   this.applyDeleteLocally(commentId);

   this.commentService.deleteComment(commentId)
   .pipe(takeUntilDestroyed(this.destroyRef))
   .subscribe({
     next: () => this.interactionService.notifyCommentDeleted(this.data.threadId),
     error: () => this.comments.set(previousComments) // Revertir si falla
   });
    }

    // Aplicar eliminación localmente en el Signal
  private applyDeleteLocally(commentId: number): void {
      this.comments.update(allComments => 
        allComments
          .filter(c => c.id !== commentId)
          .map(parent => ({
            ...parent,
            replies: parent.replies?.filter(r => r.id !== commentId) || []
          }))
      );
  }

  // Cerrar el modal
  public onClose(): void {
    this.dialogRef.close();
  }

  // Abrir modal para editar comentario
  openEditComment(commentId: number, currentContent: string): void {
    this.dialog.open(EditCommentModal, {
      width: '600px',
      data: { content: currentContent },
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newContent: string) => {
        if (newContent) this.editComment(commentId, newContent);
      });
  }

  // Editar comentario
  private editComment(id: number, content: string): void {
    const request: CommentRequestDto = { content };
    this.commentService.editComment(id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => this.updateCommentLocally(updated),
      });
  }

  // Actualizar comentario localmente en el Signal
  private updateCommentLocally(updated: CommentResponseDto): void {
    this.comments.update(list => list.map(c => {
      if (c.id === updated.id) return { ...updated, replies: c.replies };
      if (c.replies) {
        return { 
          ...c, 
          replies: c.replies.map(r => r.id === updated.id ? updated : r) 
        };
      }
      return c;
    }));
  }

  // Iniciar respuesta a un comentario
  public startReplying(commentId: number): void {
    this.replyingToCommentId.set(commentId);
    this.replyControl.reset();
  }

  // Enviar respuesta a un comentario
  public sendReply(parentCommentId: number): void {
    if (this.replyControl.invalid) return;

    const content = this.replyControl.getRawValue();
    this.replyControl.disable();

    this.commentService.replyToComment(parentCommentId, content)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newReply) => {
          this.comments.update(list => list.map(c => 
            c.id === parentCommentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
          ));
          this.interactionService.notifyCommentAdded(this.data.threadId);
          this.replyingToCommentId.set(null);
          this.replyControl.enable();
        },
        error: () => this.replyControl.enable()
      });
  }

}
