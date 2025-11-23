import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BottonNav } from "../../../../components/botton-nav/botton-nav";
import { Header } from "../../../../components/header/header";

interface BlockedUser {
  id: number;
  username: string;
}

@Component({
  selector: 'app-privacy-blocking',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule, BottonNav, Header],
  templateUrl: './privacy-blocking.html',
  styleUrl: './privacy-blocking.css',
})
export class PrivacyBlocking {
// Datos Hardcodeados de usuarios bloqueados
blockedUsers: BlockedUser[] = [
  { id: 1, username: '@user44' },
  { id: 2, username: '@user777' },
  { id: 3, username: '@user99' },
  { id: 4, username: '@user101' }, // Extra para probar scroll
  { id: 5, username: '@spammer01' } // Extra para probar scroll
];

// Configuración de privacidad
privacySettings = {
  anyUser: true,
  onlyAccepted: false,
  none: false
};

constructor() {}

// Lógica para que los toggles funcionen como Radio Buttons (mutuamente excluyentes)
onPrivacyChange(type: 'any' | 'accepted' | 'none') {
  if (type === 'any' && this.privacySettings.anyUser) {
    this.privacySettings.onlyAccepted = false;
    this.privacySettings.none = false;
  } else if (type === 'accepted' && this.privacySettings.onlyAccepted) {
    this.privacySettings.anyUser = false;
    this.privacySettings.none = false;
  } else if (type === 'none' && this.privacySettings.none) {
    this.privacySettings.anyUser = false;
    this.privacySettings.onlyAccepted = false;
  } else {
    // Evitar que se queden todos apagados (opcional, fuerza a que uno esté activo)
    // Si el usuario apaga el que está activo, lo volvemos a encender o ponemos uno por defecto
    if (!this.privacySettings.anyUser && !this.privacySettings.onlyAccepted && !this.privacySettings.none) {
       // Volver a activar el que se acaba de desactivar o dejarlo así según preferencia
       // this.privacySettings[type === 'any' ? 'anyUser' : type === 'accepted' ? 'onlyAccepted' : 'none'] = true;
    }
  }
}
}
