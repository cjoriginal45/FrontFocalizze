import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
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

// Interfaz para la data que recibe el modal
// Interface for the data that the modal receives
export interface DialogData {
  postId: number; // El ID que nos pasa el FeedComponent / The ID that the FeedComponent passes to us
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
  ],
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments {
  private commentService = inject(Comment);
  public dialogRef = inject(MatDialogRef<Comments>);
  public data: DialogData = inject(MAT_DIALOG_DATA);

  // Estado del componente
  // Component state
  comments: CommentResponseDto[] = [];
  isLoading = false;

  // Formulario para el nuevo comentario
  // Form for new comment
  commentControl = new FormControl('', [Validators.required, Validators.maxLength(280)]);

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading = true;
    this.commentService.getComments(this.data.postId, 0, 20).subscribe({
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
    this.commentControl.disable(); // Deshabilitamos el input mientras se envía / We disable the input while it is being sent

    this.commentService.createComment(this.data.postId, content).subscribe({
      next: (newComment) => {
        // Añadimos el nuevo comentario al principio de la lista para feedback instantáneo
        // We add the new comment to the top of the list for instant feedback
        this.comments = [newComment, ...this.comments];
        this.commentControl.reset(); // Limpiamos el input / We clean the input
        this.commentControl.enable(); // Lo volvemos a habilitar / We re-enable it
      },
      error: (err) => {
        console.error('Error al publicar el comentario', err);
        this.commentControl.enable(); // Habilitamos de nuevo si hay error / We enable again if there is an error
      },
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
