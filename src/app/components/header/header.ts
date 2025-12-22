import {
  Component,
  inject,
  computed,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Menu } from '../menu/menu';
import { SearchBar } from '../search-bar/search-bar';

import { Auth } from '../../services/auth/auth';
import { NotificationState } from '../../services/notification-state/notification-state';
import { Theme } from '../../services/themeService/theme';
import { Responsive } from '../../services/responsive/responsive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchBar, Menu, MatToolbar, MatIcon, RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  // Inyección de dependencias moderna
  private authService = inject(Auth);
  private notificationStateService = inject(NotificationState);
  private themeService = inject(Theme);
  private responsiveService = inject(Responsive);

  // Signal Inputs (Reemplazo de @Input)
  // Se define valor por defecto false, igual que en el original
  public disableShadow = input<boolean>(false);

  // Signal ViewChild (Reemplazo de @ViewChild)
  // Acceso seguro y tipado al componente hijo
  public menuComponent = viewChild.required(Menu);

  // Observables y Signals expuestos
  // No se modifican los servicios, solo se consumen
  public isMobile$ = this.responsiveService.isMobile$;
  public currentUser = this.authService.currentUser;
  public hasUnreadNotifications = this.notificationStateService.hasUnreadNotifications;

  // Lógica computada para assets
  public logoPath = computed(() => {
    return this.themeService.currentTheme() === 'dark'
      ? 'assets/images/focalizze-logo-small-dark-theme.webp'
      : 'assets/images/focalizze-logo-small.webp';
  });

  // Métodos de interacción
  public onMenuClick(): void {
    // Acceso mediante signal execution ()
    this.menuComponent().toggle();
  }
}
