import { Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-menu',
  imports: [
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatNavList,
    MatIcon,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {

  public authService = inject(Auth);


  // @ViewChild nos permite controlar el <mat-sidenav> de nuestra plantilla
  // @ViewChild allows us to control the <mat-sidenav> of our template
  @ViewChild('sidenav') public matSidenav!: MatSidenav;

  // @Input permite que el padre (Header) nos pase el observable isMobile$
  // // @Input allows the parent (Header) to pass us the isMobile$ observable
  @Input() isMobile$!: Observable<boolean>;

  // Este es el método PÚBLICO que el Header llamará
  // This is the PUBLIC method that the Header will call
  public toggle(): void {
    this.matSidenav.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.matSidenav.close(); // Cierra el menú al hacer logout
  }
}
