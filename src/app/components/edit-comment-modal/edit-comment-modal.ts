import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-comment-modal',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    CdkTextareaAutosize,
    TranslateModule
  ],
  templateUrl: './edit-comment-modal.html',
  styleUrl: './edit-comment-modal.css',
})
export class EditCommentModal implements OnInit {
  // Control del formulario para el contenido
  contentControl = new FormControl('', [Validators.required, Validators.maxLength(280)]);

  constructor(
    public dialogRef: MatDialogRef<EditCommentModal>,
    @Inject(MAT_DIALOG_DATA) public data: { content: string }
  ) {}

  ngOnInit(): void {
    // Inicializamos el textarea con el contenido actual del comentario
    this.contentControl.setValue(this.data.content);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.contentControl.valid) {
      // Devolvemos el nuevo contenido al cerrar
      this.dialogRef.close(this.contentControl.value);
    }
  }
}
