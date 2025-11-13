import { Component, inject, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, AuthUser } from '../../services/auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-botton-nav',
  imports: [MatIconModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './botton-nav.html',
  styleUrl: './botton-nav.css',
})
export class BottonNav {
  private authService = inject(Auth);
  public currentUser: Signal<AuthUser | null>;

  constructor() {
    this.currentUser = this.authService.currentUser;
  }
}
