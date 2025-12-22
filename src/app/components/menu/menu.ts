import {
  Component,
  computed,
  inject,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { Auth } from '../../services/auth/auth';
import { Theme } from '../../services/themeService/theme';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatNavList,
    MatIcon,
    CommonModule,
    RouterLink,
    TranslateModule,
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  // Inyección de dependencias
  public authService = inject(Auth);
  private themeService = inject(Theme);

  // Signals Inputs (Reemplazo de @Input)
  // Se marca como required para garantizar la integridad del tipo
  public readonly isMobile$ = input.required<Observable<boolean>>();

  // Signal ViewChild (Reemplazo de @ViewChild)
  // Acceso seguro y reactivo al elemento del DOM
  public readonly matSidenav = viewChild.required<MatSidenav>('sidenav');

  // Computed Signals
  public readonly logoPath = computed(() => {
    return this.themeService.currentTheme() === 'dark'
      ? 'assets/images/focalizze-logo-small-dark-theme.webp'
      : 'assets/images/focalizze-logo-small.webp';
  });

  // Métodos públicos
  public toggle(): void {
    this.matSidenav().toggle();
  }

  public logout(): void {
    this.authService.logout();
    this.matSidenav().close();
  }
}
