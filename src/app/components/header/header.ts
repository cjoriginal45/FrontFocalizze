import { Component, inject, Signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { Menu } from '../menu/menu';
import { Observable } from 'rxjs';
import { Responsive } from '../../services/responsive/responsive';
import { SearchBar } from '../search-bar/search-bar';
import { Auth, AuthUser } from '../../services/auth/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [SearchBar, Menu, MatToolbar, MatIcon, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @ViewChild(Menu) public menuComponent!: Menu;
  public isMobile$: Observable<boolean>;

  private authService = inject(Auth);
  public currentUser: Signal<AuthUser | null>;

  constructor(private responsiveService: Responsive) {
    this.isMobile$ = this.responsiveService.isMobile$;
    this.currentUser = this.authService.currentUser;
  }

  onMenuClick(): void {
    this.menuComponent.toggle();
  }
}
