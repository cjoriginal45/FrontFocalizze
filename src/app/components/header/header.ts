import { Component, inject, Signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { Menu } from '../menu/menu';
import { Observable } from 'rxjs';
import { Responsive } from '../../services/responsive/responsive';
import { SearchBar } from '../search-bar/search-bar';
import { Auth, AuthUser } from '../../services/auth/auth';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationState } from '../../services/notification-state/notification-state';
import { MatBadgeModule } from '@angular/material/badge';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchBar, Menu, MatToolbar, MatIcon, RouterModule, CommonModule,MatBadgeModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @ViewChild(Menu) public menuComponent!: Menu;
  public isMobile$: Observable<boolean>;

  private authService = inject(Auth);
  private notificationStateService = inject(NotificationState);

  public currentUser: Signal<AuthUser | null>;
  public hasUnreadNotifications: Signal<boolean>;

  constructor(private responsiveService: Responsive) {
    this.isMobile$ = this.responsiveService.isMobile$;
    this.currentUser = this.authService.currentUser;
    this.hasUnreadNotifications = this.notificationStateService.hasUnreadNotifications;
  }

  onMenuClick(): void {
    this.menuComponent.toggle();
  }
}
