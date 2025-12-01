import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class Language {
  private translate = inject(TranslateService);
  private readonly LANG_KEY = 'selected_language';

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    // Idiomas disponibles
    this.translate.addLangs(['es', 'en', 'pt', 'fr']);
    
    // Idioma por defecto si no hay traducción
    this.translate.setDefaultLang('es');

    // Recuperar del localStorage o usar el del navegador
    const savedLang = localStorage.getItem(this.LANG_KEY);
    
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      // Detectar idioma del navegador
      const browserLang = this.translate.getBrowserLang();
      const langToUse = browserLang?.match(/es|en|pt|fr/) ? browserLang : 'es';
      this.translate.use(langToUse);
    }
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
