import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogContent,
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
    MatDialogContent,
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
    TranslateModule,
  ],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments {
  private commentService = inject(Comment);
  private interactionService = inject(Interaction);
  public dialogRef = inject(MatDialogRef<Comments>);
  public data: DialogData = inject(MAT_DIALOG_DATA);
  public authService = inject(Auth);
  private dialog = inject(MatDialog);

  // Estado del componente
  // Component state
  comments: CommentResponseDto[] = [];
  isLoading = false;

  // Formulario para el nuevo comentario
  // Form for new comment
  commentControl = new FormControl('', [Validators.required, Validators.maxLength(280)]);

  replyingToCommentId: number | null = null;
  replyControl = new FormControl('', [Validators.required, Validators.maxLength(280)]);

  defaultAvatar = 'assets/images/default-avatar.png';

  isThreadAuthor = false;

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.data.username) {
      this.isThreadAuthor = currentUser.username === this.data.username;
    }
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading = true;
    this.commentService.getComments(this.data.threadId, 0, 20).subscribe({
      next: (page) => {
        this.comments = page.content;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar comentarios', err);
        this.isLoading = false;
      },
    });
  }

  postComment(): void {
    if (this.commentControl.invalid || !this.commentControl.value) {
      return;
    }
    const content = this.commentControl.value;
    this.commentControl.disable();

    this.commentService.createComment(this.data.threadId, content).subscribe({
      next: (newComment) => {
        // Actualizamos la lista local de comentarios para que se vea el nuevo
        // We update the local list of comments to show the new one
        this.comments.unshift(newComment);
        this.commentControl.reset();
        this.commentControl.enable();

        // Notificamos al servicio de interacción que se ha añadido un comentario a un hilo específico.
        // We notify the interaction service that a comment has been added to a specific thread.
        this.interactionService.notifyCommentAdded(this.data.threadId);
      },
      error: (err) => {
        console.error('Error al publicar el comentario', err);
        this.commentControl.enable();
      },
    });
  }

  openDeleteConfirm(commentId: number): void {
    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: '¿Eliminar Comentario?',
        message: 'Esta acción no se puede deshacer. El comentario será eliminado.',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Si el usuario confirma, procedemos a borrar.
      if (result === true) {
        this.deleteComment(commentId);
      }
    });
  }

  private deleteComment(commentId: number): void {
    // Guardamos referencia por si hay error (optimista)
    const originalComments = JSON.parse(JSON.stringify(this.comments)); 

    // 1. Intentar borrar si es un comentario raíz
    const isRoot = this.comments.some(c => c.id === commentId);
    
    if (isRoot) {
      this.comments = this.comments.filter(c => c.id !== commentId);
    } else {
      // 2. Si no es raíz, buscar dentro de las respuestas de cada comentario
      this.comments.forEach(parent => {
        if (parent.replies && parent.replies.length > 0) {
          parent.replies = parent.replies.filter(r => r.id !== commentId);
        }
      });
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.interactionService.notifyCommentDeleted(this.data.threadId);
        // Aquí iría tu lógica de reembolso de interacción si la necesitas...
        console.log(`Comentario ${commentId} eliminado con éxito.`);
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        // Revertimos cambios si falla
        this.comments = originalComments; 
      },
    });
  }


  onClose(): void {
    this.dialogRef.close();
  }

  openEditComment(commentId: number, currentContent: string): void {
    // 1. Primero, el diálogo de confirmación (tu lógica actual)
    const confirmRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: '¿Quieres editar el comentario?',
        message: 'Se abrirá un editor para modificar el contenido del comentario.',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
      },
    });

    confirmRef.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        // 2. Si confirma, abrimos el modal de edición
        this.openEditModal(commentId, currentContent);
      }
    });
  }

  private openEditModal(commentId: number, currentContent: string): void {
    const editRef = this.dialog.open(EditCommentModal, {
      width: '600px',
      data: { content: currentContent },
    });

    editRef.afterClosed().subscribe((newContent) => {
      if (newContent) {
        // 3. Si guardó cambios, llamamos a la API
        this.editComment(commentId, newContent);
      }
    });
  }

  private editComment(id: number, content: string): void {
    const commentRequest: CommentRequestDto = { content };

    this.commentService.editComment(id, commentRequest).subscribe({
      next: (updatedComment) => {
        
        // 1. Buscar en la lista raíz
        const rootIndex = this.comments.findIndex((c) => c.id === id);

        if (rootIndex !== -1) {
          const existingReplies = this.comments[rootIndex].replies;
          this.comments[rootIndex] = { ...updatedComment, replies: existingReplies };
        } else {
          // 2. Buscar en las respuestas (Nested loop)
          for (const parent of this.comments) {
            if (parent.replies) {
              const replyIndex = parent.replies.findIndex(r => r.id === id);
              if (replyIndex !== -1) {
                // Es una respuesta: la actualizamos
                parent.replies[replyIndex] = updatedComment;
                break; // Terminamos la búsqueda
              }
            }
          }
        }

        this.commentControl.reset();
        this.commentControl.enable();
      },
      error: (err) => {
        console.error('Error al editar el comentario', err);
      },
    });
  }

  startReplying(commentId: number): void {
    this.replyingToCommentId = commentId;
    this.replyControl.reset();
  }

  cancelReply(): void {
    this.replyingToCommentId = null;
    this.replyControl.reset();
  }

  sendReply(parentCommentId: number): void {
    if (this.replyControl.invalid || !this.replyControl.value) return;

    const content = this.replyControl.value;
    this.replyControl.disable();

    this.commentService.replyToComment(parentCommentId, content).subscribe({
      next: (newReply) => {
        // Buscamos el comentario padre y le agregamos la respuesta
        const parent = this.comments.find((c) => c.id === parentCommentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(newReply);
        }
        this.interactionService.notifyCommentAdded(this.data.threadId);
        this.cancelReply();
        this.replyControl.enable();
      },
      error: (err) => {
        console.error('Error al responder', err);
        this.replyControl.enable();
      },
    });
  }
}
