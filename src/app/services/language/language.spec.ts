import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { of, throwError } from 'rxjs';
import { Language } from './language';

describe('Language Service', () => {
  let service: Language;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('TranslateService', [
      'addLangs', 
      'setDefaultLang', 
      'use', 
      'getBrowserLang'
    ]);

    TestBed.configureTestingModule({
      providers: [
        Language,
        { provide: TranslateService, useValue: spy }
      ]
    });

    service = TestBed.inject(Language);
    translateSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    
    // Limpiamos localStorage antes de cada test
    localStorage.clear();
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('init()', () => {
    it('debería usar el idioma guardado en localStorage si existe', async () => {
      // Arrange
      const savedLang = 'fr';
      localStorage.setItem('selected_language', savedLang);
      translateSpy.use.and.returnValue(of({}));

      // Act
      const result = await service.init();

      // Assert
      expect(translateSpy.use).toHaveBeenCalledWith(savedLang);
      expect(result).toBeTrue();
    });

    it('debería usar el idioma del navegador si no hay nada en localStorage', async () => {
      // Arrange
      translateSpy.getBrowserLang.and.returnValue('pt');
      translateSpy.use.and.returnValue(of({}));

      // Act
      await service.init();

      // Assert
      expect(translateSpy.use).toHaveBeenCalledWith('pt');
    });

    it('debería usar el idioma por defecto (es) si el idioma del navegador no está soportado', async () => {
      // Arrange
      translateSpy.getBrowserLang.and.returnValue('ru'); // Ruso no soportado
      translateSpy.use.and.returnValue(of({}));

      // Act
      await service.init();

      // Assert
      expect(translateSpy.use).toHaveBeenCalledWith('es');
    });

    it('debería manejar errores en la carga de traducción y hacer fallback a "es"', async () => {
      // Arrange
      translateSpy.use.withArgs('fr').and.returnValue(throwError(() => new Error('Net Error')));
      translateSpy.use.withArgs('es').and.returnValue(of({}));
      localStorage.setItem('selected_language', 'fr');

      // Act
      const result = await service.init();

      // Assert
      expect(translateSpy.use).toHaveBeenCalledWith('es'); // Fallback ejecutado
      expect(result).toBeTrue();
    });
  });

  describe('changeLanguage()', () => {
    it('debería cambiar el idioma y persistirlo en localStorage', () => {
      // Arrange
      const newLang = 'en';
      translateSpy.use.and.returnValue(of({}));

      // Act
      service.changeLanguage(newLang);

      // Assert
      expect(translateSpy.use).toHaveBeenCalledWith(newLang);
      expect(localStorage.getItem('selected_language')).toBe(newLang);
    });

    it('debería usar el idioma por defecto si se intenta cambiar a uno no soportado', () => {
      // Act
      service.changeLanguage('it'); // Italiano no soportado

      // Assert
      expect(translateSpy.use).toHaveBeenCalledWith('es');
    });
  });

  describe('getCurrentLanguage()', () => {
    it('debería retornar el idioma actual del TranslateService', () => {
      // Arrange
      (translateSpy as any).currentLang = 'pt';

      // Act
      const current = service.getCurrentLanguage();

      // Assert
      expect(current).toBe('pt');
    });
  });
});