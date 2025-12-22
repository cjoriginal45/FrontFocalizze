import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BottonNav } from "../../../../components/botton-nav/botton-nav";
import { Header } from "../../../../components/header/header";
import { TranslateModule } from '@ngx-translate/core';
import { Language } from '../../../../services/language/language';
import {Location as AngularLocation } from '@angular/common';

interface LanguageInterface {
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
    Header,
    TranslateModule 
],
  templateUrl: './language-settings.html',
  styleUrl: './language-settings.css',
})
export class LanguageSettings implements OnInit {
  private languageService = inject(Language);
  private location = inject(AngularLocation);

  languages: LanguageInterface[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Portugués' },
    { code: 'fr', name: 'Francés' }
  ];

  selectedLanguage: string = 'es';

  ngOnInit() {
    // Cargar el idioma actual al iniciar la página
    this.selectedLanguage = this.languageService.getCurrentLanguage();
  }

  saveLanguage() {
    // Cambiar el idioma dinámicamente
    this.languageService.changeLanguage(this.selectedLanguage);
    
    // Con ngx-translate NO es necesario reiniciar la app, 
    // pero si quieres dar feedback visual:
    console.log('Idioma cambiado a:', this.selectedLanguage);
  }

  goBack(): void {
    this.location.back();
  }
}
