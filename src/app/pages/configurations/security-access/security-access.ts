import { Component, inject } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Header } from '../../../components/header/header';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { BottonNav } from '../../../components/botton-nav/botton-nav';

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
export class SecurityAccess {
  private location = inject(AngularLocation);

  isTwoFactorEnabled = true;

  goBack(): void {
    this.location.back();
  }

  changePassword(): void {
    console.log('Navegar a cambiar contraseña');
  }

  toggleTwoFactor(): void {
    this.isTwoFactorEnabled = !this.isTwoFactorEnabled;
    console.log('2FA estado:', this.isTwoFactorEnabled);
  }

  logoutAllDevices(): void {
    console.log('Cerrando sesión en todos los dispositivos...');
  }
}
