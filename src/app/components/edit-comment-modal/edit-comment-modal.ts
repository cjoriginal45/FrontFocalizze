import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Interfaz estricta para los datos recibidos por el modal.
 */
interface EditCommentData {
  content: string;
}

@Component({
  selector: 'app-edit-comment-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TextFieldModule,
    TranslateModule
  ],
  templateUrl: './edit-comment-modal.html',
  styleUrl: './edit-comment-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCommentModal implements OnInit {

    // Inyección funcional moderna
    private readonly dialogRef = inject(MatDialogRef<EditCommentModal>);
    public readonly data = inject<EditCommentData>(MAT_DIALOG_DATA);

  
  /**
   * Control de formulario con tipado estricto y validaciones.
   * Usamos nonNullable: true para asegurar que el valor siempre sea un string.
   */
  public readonly contentControl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(280)]
  });


  ngOnInit(): void {
    // Inicialización segura del contenido
    if (this.data?.content) {
      this.contentControl.setValue(this.data.content);
    }
  }

  /**
   * Cierra el modal sin retornar datos.
   */
  public onCancel(): void {
    this.dialogRef.close();
  }

   /**
   * Cierra el modal retornando el nuevo contenido si el formulario es válido.
   */
   public onSave(): void {
    if (this.contentControl.valid) {
      this.dialogRef.close(this.contentControl.getRawValue());
    }
  }
}
