import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth/auth';
<<<<<<< HEAD
import { Theme } from '../../services/themeService/theme';
=======
import { TranslateModule } from '@ngx-translate/core';
>>>>>>> d0beb9e411ae4e5d7a86fa188c586ede3ff9e307

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnDestroy {
  loginData = {
    identifier: '',
    password: '',
  };

  errorMessage: string | null = null;
  private errorTimer: any = null; // Referencia al temporizador

  passwordInputType: string = 'password';
  showPasswordIcon: string = 'visibility';

  private themeService = inject(Theme);

  logoPath = computed(() => {
    return this.themeService.currentTheme() === 'dark'
      ? 'assets/images/focalizze-logo-dark-theme.webp' // Ruta imagen oscura (letras claras)
      : 'assets/images/focalizze-logo.webp'; // Ruta imagen clara (letras oscuras)
  });

  constructor(private authService: Auth, private router: Router) {}

  // Método que se ejecuta al enviar el formulario.
  onSubmit(): void {
    this.errorMessage = null;

    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }

    // VALIDACIÓN: Si el identificador o la contraseña están vacíos, no continuar.
    if (!this.loginData.identifier || !this.loginData.password) {
      // Opcional: Puedes mostrar un mensaje de error si quieres.
      // this.errorMessage = 'El usuario y la contraseña son obligatorios.';
      return;
    }

    // Este código solo se ejecutará si la validación anterior pasa
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso!', response);
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        console.error('Error en el login', err);
        this.errorMessage = 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';

        this.errorTimer = setTimeout(() => {
          this.errorMessage = null;
        }, 7000); // 7 segundos
      },
    });
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

  ngOnDestroy(): void {
    // Nos aseguramos de limpiar el temporizador para prevenir fugas de memoria
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
    }
  }
}
