import { Component, inject, OnInit } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Header } from '../../../components/header/header';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterModule } from '@angular/router';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { SecurityService } from '../../../services/securityService/security-service';
import { Auth } from '../../../services/auth/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmMatDialog } from '../../../components/mat-dialog/mat-dialog/mat-dialog';

@Component({
  selector: 'app-security-access',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    RouterModule,
    BottonNav,
    Header,
  ],
  templateUrl: './security-access.html',
  styleUrl: './security-access.css',
})
export class SecurityAccess implements OnInit {
  private location = inject(AngularLocation);
  private router = inject(Router);
  private securityService = inject(SecurityService);
  private authService = inject(Auth);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  isTwoFactorEnabled = false;
  isLoading = false;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.isTwoFactorEnabled = user.isTwoFactorEnabled ?? false;
    }
  }

  goBack(): void {
    this.location.back();
  }

  /**
   * Redirige a la página de recuperación de contraseña.
   */
  changePassword(): void {
    // Navegamos a la ruta solicitada
    this.router.navigate(['/password-recovery']);
  }

  /**
   * Lógica para activar/desactivar 2FA con reversión en caso de error.
   */
  toggleTwoFactor(): void {
    const previousState = this.isTwoFactorEnabled;
    const newState = !previousState;

    // 1. Actualización Optimista (cambiamos la UI inmediatamente)
    this.isTwoFactorEnabled = newState;

    // 2. Llamada a la API
    this.securityService.toggleTwoFactor(newState).subscribe({
      next: () => {
        const message = newState
          ? 'Autenticación en 2 pasos activada (Email).'
          : 'Autenticación en 2 pasos desactivada.';

        this.snackBar.open(message, 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error al cambiar 2FA', err);
        // 3. Reversión (Si falla, volvemos al estado anterior)
        this.isTwoFactorEnabled = previousState;
        this.snackBar.open(
          'No se pudo actualizar la configuración. Intente nuevamente.',
          'Cerrar',
          { duration: 3000 }
        );
      },
    });
  }

  /**
   * Cierra sesión en todos los dispositivos con confirmación.
   */
  logoutAllDevices(): void {
    const dialogRef = this.dialog.open(ConfirmMatDialog, {
      data: {
        title: '¿Cerrar sesión en todos lados?',
        message:
          'Se cerrará tu sesión en este dispositivo y en cualquier otro donde hayas ingresado. Tendrás que volver a iniciar sesión.',
        confirmButtonText: 'Cerrar todas las sesiones',
        confirmButtonColor: 'warn',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.executeLogoutAll();
      }
    });
  }

  private executeLogoutAll(): void {
    this.isLoading = true;
    this.securityService.logoutAllDevices().subscribe({
      next: () => {
        this.snackBar.open('Sesiones cerradas correctamente.', 'OK', { duration: 3000 });
        // Forzamos el logout local en el cliente actual
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesiones', err);
        this.isLoading = false;
        this.snackBar.open('Error al conectar con el servidor.', 'Cerrar', { duration: 3000 });
      },
    });
  }
}
