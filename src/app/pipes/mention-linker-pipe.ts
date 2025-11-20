import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'mentionLinker',
  standalone: true, // Es buena práctica hacerlo standalone
})
export class MentionLinkerPipe implements PipeTransform {
  // Inyectamos el DomSanitizer para marcar el HTML como seguro
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    // Usamos una expresión regular para encontrar todas las ocurrencias de @username
    // La expresión busca una @ seguida de uno o más caracteres de palabra (letras, números, guion bajo)
    const linkedText = value.replace(
      /@(\w+)/g,
      // Para cada coincidencia, la reemplazamos con una etiqueta <a>
      // $& contiene la coincidencia completa (ej: @focalizze)
      // $1 contiene solo el primer grupo de captura (ej: focalizze)
      '<a href="/profile/$1" class="mention-link" target="_blank" rel="noopener noreferrer">$&</a>'
    );

    // Devolvemos el HTML transformado, marcado como seguro para ser renderizado
    return this.sanitizer.bypassSecurityTrustHtml(linkedText);
  }
}
