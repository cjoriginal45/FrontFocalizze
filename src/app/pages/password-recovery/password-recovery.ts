import { Component, computed, inject, OnInit } from '@angular/core';
import { Header } from '../../components/header/header';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PasswordReset } from '../../services/password-reset';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Theme } from '../../services/themeService/theme';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './password-recovery.html',
  styleUrl: './password-recovery.css',
})
export class PasswordRecovery implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private passwordResetService = inject(PasswordReset);
  private themeService = inject(Theme);

  // Controla qué vista mostrar: 'request' (pedir email) o 'reset' (nueva contraseña)
  view: 'request' | 'reset' | 'invalid_token' | 'success' | 'email_sent' = 'request';

  // Modelos para los inputs
  public email = '';
  newPassword = '';
  confirmPassword = '';

  // Variables de estado
  errorMessage: string | null = null;
  isLoading = false;
  private token: string | null = null;

  logoPath = computed(() => {
    return this.themeService.currentTheme() === 'dark'
      ? 'assets/images/focalizze-logo-dark-theme.webp'
      : 'assets/images/focalizze-logo.webp';
  });

  ngOnInit(): void {
    // Comprueba si la URL contiene un token
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      this.isLoading = true;
      // FASE 2: Validar el token
      this.passwordResetService.validateResetToken(this.token).subscribe({
        next: () => {
          this.view = 'reset';
          this.isLoading = false;
        },
        error: () => {
          this.view = 'invalid_token';
          this.isLoading = false;
        },
      });
    }
  }

  // FASE 1: Enviar solicitud de reseteo
  requestReset(): void {
    if (!this.email) return;
    this.isLoading = true;
    this.passwordResetService.forgotPassword(this.email).subscribe(() => {
      this.view = 'email_sent';
      this.isLoading = false;
    });
  }

  // FASE 3: Enviar la nueva contraseña
  resetPassword(): void {
    if (!this.newPassword || !this.confirmPassword || !this.token) return;
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;
    this.passwordResetService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.view = 'success';
        this.isLoading = false;
        // Redirigir al login después de unos segundos
        setTimeout(() => this.router.navigate(['/login']), 4000);
      },
      error: () => {
        this.errorMessage = 'Ocurrió un error. El enlace puede haber expirado.';
        this.isLoading = false;
      },
    });
  }
}
