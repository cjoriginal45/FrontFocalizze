import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Header } from '../../../components/header/header';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { Admin } from '../../../services/admin/admin';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-admin',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    Header,
    BottonNav,
  ],
  templateUrl: './create-admin.html',
  styleUrl: './create-admin.css',
})
export class CreateAdmin {
  private fb = inject(FormBuilder);
  private adminService = inject(Admin);
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);
  private router = inject(Router);

  isLoading = false;

  // Formulario con validadores
  adminForm = this.fb.group(
    {
      targetUsername: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  // Validador personalizado para coincidencia de contraseñas
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (this.adminForm.invalid) return;

    this.isLoading = true;
    const { targetUsername, password } = this.adminForm.getRawValue();

    // Quitamos el '@' si el usuario lo ingresó
    const cleanUsername = targetUsername!.startsWith('@')
      ? targetUsername!.substring(1)
      : targetUsername!;

    this.adminService
      .promoteUser({
        targetUsername: cleanUsername,
        adminPassword: password!,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(`¡@${cleanUsername} ahora es Administrador!`, 'OK', {
            duration: 4000,
            panelClass: ['success-snackbar'],
          });
          this.adminForm.reset();
          // Opcional: navegar atrás
          // this.goBack();
        },
        error: (err) => {
          this.isLoading = false;
          let msg = 'Ocurrió un error al procesar la solicitud.';

          if (err.status === 403) msg = 'Contraseña de administrador incorrecta.';
          if (err.status === 404) msg = 'El usuario especificado no existe.';
          if (err.status === 409) msg = 'Este usuario ya es administrador.'; // Si el backend lanza IllegalState

          this.snackBar.open(msg, 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }
}
