import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { RegisterService } from '../../services/registerService/register';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../interfaces/RegisterRequest';
import { RegisterResponse } from '../../interfaces/RegisterResponse';

@Component({
  selector: 'app-register',
  imports: [MatIconModule, RouterLink, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnDestroy {
  passwordInputType: string = 'password';
  passwordIcon: string = 'visibility';

  confirmPasswordInputType: string = 'password';
  confirmPasswordIcon: string = 'visibility';

  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  isLoading: boolean = false;
  errorMessage: string = '';

  private errorTimeout: any;

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

  showError(message: string): void {
    this.errorMessage = message;

    // Si ya existía un temporizador, límpialo para reiniciar la cuenta
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }

    // Crea un nuevo temporizador y guarda su ID
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, 7000); // 7 segundos
  }

  setErrorMessage(message: string) {
    // Cancel the previous timer if it exists / Cancelar el temporizador anterior si existe
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    this.errorMessage = message;
    // Set a new timer to clear the message after 7 seconds / Establecer un nuevo temporizador para limpiar el mensaje después de 7 segundos
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, 7000);
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
      this.setErrorMessage('Todos los campos son obligatorios');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Make the registration / Realizar el registro
    this.isLoading = true;

    this.registerService.register(this.registerData).subscribe({
      next: (response: RegisterResponse) => {
        this.isLoading = false;
        console.log('Registro exitoso:', response);

        // Redirect to login after successful registration / Redirigir al login después del registro exitoso
        this.router.navigate(['/'], {
          queryParams: { message: 'Registro exitoso. Ya puedes iniciar sesión.' },
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error en el registro:', error);

        // Handling different types of errors / Manejar diferentes tipos de errores
        if (error.error && error.error.error) {
          this.setErrorMessage(error.error.error);
        } else if (error.status === 0) {
          this.setErrorMessage('Error de conexión. Verifica que el servidor esté funcionando.');
        } else {
          this.setErrorMessage('Error en el registro. Inténtalo de nuevo.');
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }
}
