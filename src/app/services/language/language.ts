import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class Language {
  private translate = inject(TranslateService);
  private readonly LANG_KEY = 'selected_language';

  constructor() {
    // Configuramos los idiomas disponibles
    this.translate.addLangs(['es', 'en', 'pt', 'fr']);
    this.translate.setDefaultLang('es');
  }

  /**
   * Método de inicialización que devuelve una Promesa.
   * Angular esperará a que esto termine antes de mostrar la app.
   */
  public init(): Promise<any> {
    return new Promise((resolve) => {
      // 1. Determinar qué idioma usar
      let langToUse = 'es';
      const savedLang = localStorage.getItem(this.LANG_KEY);

      if (savedLang) {
        langToUse = savedLang;
      } else {
        const browserLang = this.translate.getBrowserLang();
        if (browserLang && browserLang.match(/es|en|pt|fr/)) {
          langToUse = browserLang;
        }
      }

      console.log(`[LanguageService] Inicializando idioma: ${langToUse}`);

      // 2. Usar el idioma y ESPERAR a que cargue
      // translate.use() devuelve un Observable que se completa cuando carga el JSON
      this.translate.use(langToUse).subscribe({
        next: () => {
          console.log(`[LanguageService] Idioma ${langToUse} cargado correctamente.`);
          resolve(true); // Liberamos la carga de la app
        },
        error: () => {
          console.error(`[LanguageService] Error cargando idioma ${langToUse}. Usando defecto.`);
          // Si falla, intentamos cargar el por defecto para no romper la app
          this.translate.use('es').subscribe(() => resolve(true));
        }
      });
    });
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
