import { CommonModule, Location as AngularLocation } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Header } from '../../../../components/header/header';
import { BottonNav } from '../../../../components/botton-nav/botton-nav';

interface NotificationSettingsInterface {
  newFollowers: boolean;
  comments: boolean;
  likes: boolean;
  mentions: boolean;
  dailySummary: boolean;
}

@Component({
  selector: 'app-notification-settings',
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    Header,
    BottonNav,
  ],
  templateUrl: './notification-settings.html',
  styleUrl: './notification-settings.css',
})
export class NotificationSettings {
  private location = inject(AngularLocation);
  // Estado inicial basado en la imagen (algunos on, algunos off)
  settings: NotificationSettingsInterface = {
    newFollowers: false,
    comments: true,
    likes: false,
    mentions: false,
    dailySummary: true,
  };

  constructor() {
    // Aquí podrías cargar la configuración real del usuario
  }

  // Método de ejemplo para guardar cambios
  saveSettings() {
    console.log('Guardando configuración:', this.settings);
  }

  goBack() {
    this.location.back();
  }
}
