import { Component, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { Header } from '../../../components/header/header';
import { RouterLink } from '@angular/router';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-configuration-page',
  standalone: true,
  imports: [MatToolbar, MatIcon, MatNavList, Header, RouterLink, BottonNav, CommonModule, TranslateModule],
  templateUrl: './configuration-page.html',
  styleUrl: './configuration-page.css',
})
export class ConfigurationPage {
  private location = inject(AngularLocation);
  private authService = inject(Auth);

  userIsAdmin = this.authService.userIsAdmin();

  goBack(): void {
    this.location.back();
  }
}
