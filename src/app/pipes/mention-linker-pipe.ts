import { Pipe, PipeTransform, inject, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe que transforma menciones (@usuario) en enlaces HTML seguros.
 * Utiliza DomSanitizer para permitir la renderización de etiquetas <a>.
 */
@Pipe({
  name: 'mentionLinker',
  standalone: true,
})
export class MentionLinkerPipe implements PipeTransform {
  // Inyección funcional moderna
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Transforma un string buscando menciones y convirtiéndolas en enlaces.
   * @param value Texto original que contiene las menciones.
   * @returns SafeHtml con las menciones vinculadas.
   */
  public transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    // Regex: Busca '@' seguido de caracteres alfanuméricos o guiones bajos.
    const mentionRegex = /@(\w+)/g;

    // Sustitución por etiqueta <a> con atributos de seguridad recomendados.
    const linkedText = value.replace(
      mentionRegex,
      (match, username) => 
        `<a href="/profile/${username}" class="mention-link" target="_blank" rel="noopener noreferrer">${match}</a>`
    );

    // Marcamos el HTML resultante como seguro para Angular
    return this.sanitizer.bypassSecurityTrustHtml(linkedText);
  }
}