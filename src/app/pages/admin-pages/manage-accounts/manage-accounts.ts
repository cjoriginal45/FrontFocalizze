import { Component, inject } from '@angular/core';
import { Location as AngularLocation } from '@angular/common';
import { MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { Header } from '../../../components/header/header';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-manage-accounts',
  imports: [MatNavList, MatIcon, MatToolbar, Header, BottonNav, RouterLink],
  templateUrl: './manage-accounts.html',
  styleUrl: './manage-accounts.css',
})
export class ManageAccounts {
  private location = inject(AngularLocation);

  goBack(): void {
    this.location.back();
  }
}
