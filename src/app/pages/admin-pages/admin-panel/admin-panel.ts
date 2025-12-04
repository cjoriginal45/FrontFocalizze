import { Component, inject } from '@angular/core';
import { MatNavList } from "@angular/material/list";
import { MatIcon } from "@angular/material/icon";
import { MatToolbar } from "@angular/material/toolbar";
import { Header } from "../../../components/header/header";
import { BottonNav } from "../../../components/botton-nav/botton-nav";
import {Location as AngularLocation } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [MatNavList, MatIcon, MatToolbar, Header, BottonNav,RouterLink],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel {
  private location = inject(AngularLocation);


  goBack(): void {
    this.location.back();
  }
}
