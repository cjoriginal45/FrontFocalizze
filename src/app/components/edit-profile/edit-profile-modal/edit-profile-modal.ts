import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ProfileInterface } from '../../../interfaces/ProfileInterface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-profile-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule,
    MatButtonModule, MatFormFieldModule, MatInputModule, TranslateModule
  ],
  templateUrl: './edit-profile-modal.html',
  styleUrls: ['./edit-profile-modal.css']
})
export class EditProfileModal implements OnInit {

  profileForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditProfileModal>,
    @Inject(MAT_DIALOG_DATA) public data: { profile: ProfileInterface }, // Recibimos el perfil actual
    private fb: FormBuilder
  ) {
    // Inicializamos el formulario con los datos actuales del perfil
    this.profileForm = this.fb.group({
      displayName: [data.profile.displayName, [Validators.maxLength(50)]],
      biography: [data.profile.biography, [Validators.maxLength(160)]]
    });
    this.imagePreview = data.profile.avatarUrl;
  }

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Generar una vista previa de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      return;
    }
    // Devolvemos tanto los datos del formulario como el archivo seleccionado
    this.dialogRef.close({
      formData: this.profileForm.value,
      file: this.selectedFile
    });
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
