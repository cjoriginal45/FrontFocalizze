import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BottonNav } from "../../../../components/botton-nav/botton-nav";
import { Header } from "../../../../components/header/header";

interface Language {
  code: string;
  name: string;
}

@Component({
  selector: 'app-language-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    BottonNav,
    Header
],
  templateUrl: './language-settings.html',
  styleUrl: './language-settings.css',
})
export class LanguageSettings {
// Lista de idiomas disponibles
languages: Language[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'pt', name: 'Portugués' },
  { code: 'fr', name: 'Francés' }
];

// Idioma seleccionado por defecto (hardcodeado a Español)
selectedLanguage: string = 'es';

constructor() {}

saveLanguage() {
  console.log('Nuevo idioma seleccionado:', this.selectedLanguage);
  // Aquí iría la lógica para llamar al servicio de traducción (ej: ngx-translate)
  // y recargar la app si es necesario.
  alert(`Idioma cambiado a: ${this.getLanguageName(this.selectedLanguage)}`);
}

// Helper para mostrar el nombre en el alert
getLanguageName(code: string): string {
  return this.languages.find(l => l.code === code)?.name || code;
}
}
