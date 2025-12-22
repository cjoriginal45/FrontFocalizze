import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MentionLinkerPipe } from './mention-linker-pipe';

describe('MentionLinkerPipe', () => {
  let pipe: MentionLinkerPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MentionLinkerPipe,
        // Usamos el DomSanitizer real del navegador para las pruebas
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => val, // Mock simple para bypass
          },
        },
      ],
    });

    // Obtenemos la instancia desde el contexto de inyección
    pipe = TestBed.inject(MentionLinkerPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('debería crearse la instancia correctamente', () => {
    expect(pipe).withContext('El pipe debería ser inyectado por TestBed').toBeTruthy();
  });

  it('debería devolver un string vacío si el valor es null o undefined', () => {
    // Arrange & Act
    const resultNull = pipe.transform(null);
    const resultUndefined = pipe.transform(undefined);

    // Assert
    expect(resultNull).toBe('');
    expect(resultUndefined).toBe('');
  });

  it('debería devolver el mismo texto si no contiene menciones', () => {
    // Arrange
    const text = 'Hola mundo, este es un texto plano.';

    // Act
    const result = pipe.transform(text);

    // Assert
    expect(result).toBe(text);
  });

  it('debería transformar una mención simple en un enlace HTML', () => {
    // Arrange
    const text = 'Hola @focalizze';
    const expected = 'Hola <a href="/profile/focalizze" class="mention-link" target="_blank" rel="noopener noreferrer">@focalizze</a>';

    // Act
    const result = pipe.transform(text);

    // Assert
    expect(result).withContext('La mención debería estar envuelta en un tag <a>').toBe(expected);
  });

  it('debería transformar múltiples menciones en un texto', () => {
    // Arrange
    const text = 'Aviso para @user1 y @user_2';
    
    // Act
    const result = pipe.transform(text) as string;

    // Assert
    expect(result).toContain('/profile/user1');
    expect(result).toContain('/profile/user_2');
    expect((result.match(/<\/a>/g) || []).length).withContext('Debería haber dos etiquetas de cierre <a>').toBe(2);
  });

  it('debería llamar a bypassSecurityTrustHtml del DomSanitizer', () => {
    // Arrange
    const spy = spyOn(sanitizer, 'bypassSecurityTrustHtml').and.callThrough();
    const text = 'Texto con @mencion';

    // Act
    pipe.transform(text);

    // Assert
    expect(spy).withContext('Debería llamar al método de seguridad de Angular').toHaveBeenCalled();
  });
});