import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth/auth';
import { Theme } from '../../services/themeService/theme';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnDestroy {
  private authService = inject(Auth);
  private router = inject(Router);
  private themeService = inject(Theme);
  private snackBar = inject(MatSnackBar); // Para mostrar "Código enviado"

  // --- Datos del Formulario ---
  loginData = {
    identifier: '', // Se mapeará a 'username' al enviar
    password: '',
  };

  otpCode: string = ''; // Para el código de 2FA

  // --- Estado de la Vista ---
  step: 'credentials' | 'otp' = 'credentials'; // Controla qué pantalla se ve
  isLoading = false;

  // --- Manejo de Errores ---
  errorMessage: string | null = null;
  private errorTimer: any = null;

  // --- UI ---
  passwordInputType: string = 'password';
  showPasswordIcon: string = 'visibility';

  // --- Logo Dinámico ---
  logoPath = computed(() => {
    return this.themeService.currentTheme() === 'dark'
      ? 'assets/images/focalizze-logo-dark-theme.webp'
      : 'assets/images/focalizze-logo.webp';
  });

  // --- PASO 1: ENVIAR CREDENCIALES ---
  onSubmit(): void {
    this.clearError();

    if (!this.loginData.identifier || !this.loginData.password) {
      return;
    }

    this.isLoading = true;

    // Mapeamos 'identifier' a 'username' para que coincida con el DTO del backend
    const credentials = {
      identifier: this.loginData.identifier.trim(),
      password: this.loginData.password.trim(),
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.requiresTwoFactor) {
          // CASO A: Requiere 2FA -> Cambiamos a la pantalla de código
          this.step = 'otp';

          // Mostramos mensaje amigable
          this.snackBar.open(
            response.message || 'Código de verificación enviado a tu correo.',
            'OK',
            { duration: 5000 }
          );
        } else {
          // CASO B: Login directo -> Vamos al feed
          console.log('Login exitoso!', response);
          this.router.navigate(['/feed']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en el login', err);
        this.showError('Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.');
      },
    });
  }

  // --- PASO 2: VERIFICAR CÓDIGO OTP ---
  onVerifyOtp(): void {
    this.clearError();

    if (!this.otpCode || this.otpCode.length !== 6) {
      this.showError('El código debe tener 6 dígitos.');
      return;
    }

    this.isLoading = true;

    // Llamamos al servicio para verificar
    this.authService
      .verifyOtp({
        username: this.loginData.identifier, // Usamos el usuario que guardamos en el paso 1
        code: this.otpCode,
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Verificación 2FA exitosa!', response);
          this.router.navigate(['/feed']);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Código incorrecto o expirado.';
          this.showError(msg);
        },
      });
  }

  // --- UTILIDADES ---

  // Volver atrás si el usuario quiere corregir su correo
  cancelOtp(): void {
    this.step = 'credentials';
    this.otpCode = '';
    this.clearError();
  }

  togglePasswordVisibility(): void {
    if (this.passwordInputType === 'password') {
      this.passwordInputType = 'text';
      this.showPasswordIcon = 'visibility_off';
    } else {
      this.passwordInputType = 'password';
      this.showPasswordIcon = 'visibility';
    }
  }

  private showError(msg: string) {
    this.errorMessage = msg;
    if (this.errorTimer) clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      this.errorMessage = null;
    }, 7000);
  }

  private clearError() {
    this.errorMessage = null;
    if (this.errorTimer) clearTimeout(this.errorTimer);
  }

  ngOnDestroy(): void {
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }
  }
}
