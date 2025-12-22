import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, NonNullableFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ProfileInterface } from '../../../interfaces/ProfileInterface';
import { TranslateModule } from '@ngx-translate/core';
import { TextFieldModule } from '@angular/cdk/text-field';
/**
 * Estructura de la respuesta al cerrar el modal.
 */
export interface EditProfileResponse {
  formData: {
    displayName: string;
    biography: string;
  };
  file: File | null;
}

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    TextFieldModule
  ],
  templateUrl: './edit-profile-modal.html',
  styleUrls: ['./edit-profile-modal.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileModal implements OnInit {

   // --- Inyección de dependencias ---
   private readonly fb = inject(NonNullableFormBuilder);
   private readonly cdr = inject(ChangeDetectorRef);
   public readonly dialogRef = inject(MatDialogRef<EditProfileModal>);
   public readonly data: { profile: ProfileInterface } = inject(MAT_DIALOG_DATA);

     // --- Estado del componente ---
  public selectedFile: File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;
 
   /**
   * Formulario reactivo con tipado estricto (NonNullable).
   */
   public readonly profileForm = this.fb.group({
    displayName: [this.data.profile.displayName, [Validators.maxLength(50)]],
    biography: [this.data.profile.biography, [Validators.maxLength(160)]]
  });


  ngOnInit(): void {
    this.imagePreview = this.data.profile.avatarUrl;
  }

  /**
   * Gestiona la selección de archivos y genera la previsualización.
   */
  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      
      // FileReader es asíncrono y ocurre fuera de la detección de cambios inmediata
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.cdr.markForCheck(); // Notificamos a OnPush que hay cambios
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Envía los datos actualizados al componente padre.
   */
  public onSave(): void {
    if (this.profileForm.valid) {
      const response: EditProfileResponse = {
        formData: this.profileForm.getRawValue(),
        file: this.selectedFile
      };
      this.dialogRef.close(response);
    }
  }

  public closeModal(): void {
    this.dialogRef.close();
  }
}