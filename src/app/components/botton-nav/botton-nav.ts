import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, AuthUser } from '../../services/auth/auth';
import { CommonModule } from '@angular/common';
import { NotificationState } from '../../services/notification-state/notification-state';

/**
 * Componente de navegación inferior optimizado para dispositivos móviles.
 * Utiliza Signals para una reactividad eficiente y OnPush para minimizar ciclos de renderizado.
 */
@Component({
  selector: 'app-botton-nav',
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './botton-nav.html',
  styleUrl: './botton-nav.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottonNav {
  // Inyección de servicios mediante inject()
  private readonly authService = inject(Auth);
  private readonly notificationStateService = inject(NotificationState);

  /**
   * Signals expuestos directamente desde los servicios.
   * Se declaran como readonly para asegurar la integridad del flujo de datos.
   */
  public readonly currentUser: Signal<AuthUser | null> = this.authService.currentUser;
  public readonly hasUnreadNotifications: Signal<boolean> =
    this.notificationStateService.hasUnreadNotifications;
}
