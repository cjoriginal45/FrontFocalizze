import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** 
 * Tipado estricto para los idiomas soportados por la aplicación.
 */
export type AppLanguage = 'es' | 'en' | 'pt' | 'fr';

@Injectable({
  providedIn: 'root',
})
export class Language {
  private readonly translate = inject(TranslateService);
  private readonly LANG_KEY = 'selected_language';
  private readonly DEFAULT_LANG: AppLanguage = 'es';
  private readonly SUPPORTED_LANGS: AppLanguage[] = ['es', 'en', 'pt', 'fr'];


  constructor() {
    this.translate.addLangs(this.SUPPORTED_LANGS);
    this.translate.setDefaultLang(this.DEFAULT_LANG);
  }

 /**
   * Inicializa el idioma de la aplicación.
   * Diseñado para ser utilizado en el array de proveedores como APP_INITIALIZER.
   * @returns Promesa que se resuelve una vez que el archivo de traducción ha sido cargado.
   */
 public init(): Promise<boolean> {
  return new Promise((resolve) => {
    const langToUse = this.determineLanguage();

    console.log(`[LanguageService] Inicializando idioma: ${langToUse}`);

    this.translate.use(langToUse).subscribe({
      next: () => {
        console.log(`[LanguageService] Idioma ${langToUse} cargado correctamente.`);
        resolve(true);
      },
      error: (err) => {
        console.error(`[LanguageService] Error cargando idioma ${langToUse}:`, err);
        // Fallback al idioma por defecto en caso de error crítico de red o archivo ausente
        this.translate.use(this.DEFAULT_LANG).subscribe({
          next: () => resolve(true),
          error: () => resolve(false) // Falla silenciosamente para permitir que la app inicie
        });
      }
    });
  });
}
/**
   * Cambia el idioma actual y persiste la elección en el almacenamiento local.
   * @param lang El código del idioma (ej: 'en').
   */
public changeLanguage(lang: string): void {
  const validLang = this.isSupported(lang) ? lang : this.DEFAULT_LANG;
  this.translate.use(validLang);
  localStorage.setItem(this.LANG_KEY, validLang);
}

/**
 * Obtiene el código del idioma cargado actualmente.
 */
public getCurrentLanguage(): string {
  return this.translate.currentLang || this.DEFAULT_LANG;
}

/**
 * Determina el idioma a utilizar basándose en:
 * 1. Almacenamiento local (preferencia previa).
 * 2. Idioma del navegador.
 * 3. Idioma por defecto.
 */
private determineLanguage(): string {
  const savedLang = localStorage.getItem(this.LANG_KEY);
  
  if (savedLang && this.isSupported(savedLang)) {
    return savedLang;
  }

  const browserLang = this.translate.getBrowserLang();
  if (browserLang && this.isSupported(browserLang)) {
    return browserLang;
  }

  return this.DEFAULT_LANG;
}

/**
 * Valida si un código de idioma está dentro de los soportados.
 */
private isSupported(lang: string): lang is AppLanguage {
  return this.SUPPORTED_LANGS.includes(lang as AppLanguage);
}
}
