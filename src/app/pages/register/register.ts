import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import {
  RegisterRequest,
  RegisterResponse,
  RegisterService,
} from '../../services/registerService/register';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [MatIconModule, RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  passwordInputType: string = 'password';
  passwordIcon: string = 'visibility';

  confirmPasswordInputType: string = 'password';
  confirmPasswordIcon: string = 'visibility';

  // Template for the form / Modelo para el formulario
  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  // Loading and error states / Estados para loading y errores
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private registerService: RegisterService, private router: Router) {}

  togglePasswordVisibility(): void {
    if (this.passwordInputType === 'password') {
      this.passwordInputType = 'text';
      this.passwordIcon = 'visibility_off';
    } else {
      this.passwordInputType = 'password';
      this.passwordIcon = 'visibility';
    }
  }

  toggleConfirmPasswordVisibility(): void {
    if (this.confirmPasswordInputType === 'password') {
      this.confirmPasswordInputType = 'text';
      this.confirmPasswordIcon = 'visibility_off';
    } else {
      this.confirmPasswordInputType = 'password';
      this.confirmPasswordIcon = 'visibility';
    }
  }

  onSubmit(): void {
    // Reset error message / Resetear mensaje de error
    this.errorMessage = '';

    // Basic frontend validations / Validaciones básicas del frontend
    if (
      !this.registerData.username ||
      !this.registerData.email ||
      !this.registerData.password ||
      !this.registerData.confirmPassword
    ) {
      this.errorMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Make the registration / Realizar el registro
    this.isLoading = true;

    this.registerService.register(this.registerData).subscribe({
      next: (response: RegisterResponse) => {
        this.isLoading = false;
        console.log('Registro exitoso:', response);

        //Redirect to login after successful registration / Redirigir al login después del registro exitoso
        this.router.navigate(['/'], {
          queryParams: { message: 'Registro exitoso. Ya puedes iniciar sesión.' },
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en el registro:', error);

        // Handling different types of errors / Manejar diferentes tipos de errores
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica que el servidor esté funcionando.';
        } else {
          this.errorMessage = 'Error en el registro. Inténtalo de nuevo.';
        }
      },
    });
  }
}
