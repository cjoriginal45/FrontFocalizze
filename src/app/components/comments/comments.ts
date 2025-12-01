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

// Interfaz para la data que recibe el modal
// Interface for the data that the modal receives
export interface DialogData {
  threadId: number; // El ID que nos pasa el FeedComponent / The ID that the FeedComponent passes to us
}

@Component({
  selector: 'app-comments',
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

  defaultAvatar = 'assets/images/default-avatar.png';

  ngOnInit(): void {
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
    // 1. Buscar el comentario antes de borrarlo
    const commentToDelete = this.comments.find((c) => c.id === commentId);

    const originalComments = [...this.comments];

    // Actualización optimista (borrado visual de la lista)
    this.comments = this.comments.filter((comment) => comment.id !== commentId);

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.interactionService.notifyCommentDeleted(this.data.threadId);

        // --- LÓGICA DE REEMBOLSO DE INTERACCIÓN ---
        if (commentToDelete) {
          // Convertimos la fecha del comentario
          const commentDate = new Date(commentToDelete.createdAt);
          const today = new Date();

          // LOGS DE DEPURACIÓN (Míralos en la consola del navegador F12)
          console.log('Fecha Comentario:', commentDate.toDateString());
          console.log('Fecha Hoy:', today.toDateString());

          // Comparamos día, mes y año
          const isSameDay =
            commentDate.getDate() === today.getDate() &&
            commentDate.getMonth() === today.getMonth() &&
            commentDate.getFullYear() === today.getFullYear();

          console.log('¿Es el mismo día?:', isSameDay);

          if (isSameDay) {
            console.log('¡Reembolsando interacción visualmente!');
            this.authService.refundInteraction();
          } else {
            console.warn('No se reembolsó: Las fechas no coinciden.');
          }
        }

        console.log(`Comentario ${commentId} eliminado con éxito.`);
      },
      error: (err) => {
        console.error('Error al eliminar el comentario', err);
        this.comments = originalComments;
      },
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
