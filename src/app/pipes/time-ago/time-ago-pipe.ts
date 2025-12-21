import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para transformar fechas en un formato de "tiempo transcurrido" (ej: 5m, 2h, 15 nov).
 * Optimizado para rendimiento (pure: true por defecto).
 */
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  
  /**
   * Transforma una fecha en una cadena de texto relativa al tiempo actual.
   * @param value Fecha en formato string, Date, null o undefined.
   * @returns Representación legible del tiempo transcurrido.
   */
  public transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    
    // Validar si la fecha es inválida (ej: string corrupto)
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Evitar valores negativos si el reloj del cliente está desincronizado
    if (seconds < 0) {
      return 'Ahora';
    }

    // --- LÓGICA DE INTERVALOS ---

    // Años: > 31,536,000 segundos
    let interval = seconds / 31536000;
    if (interval >= 1) {
      return `${Math.floor(interval)}a`;
    }

    // Meses: > 2,592,000 segundos
    interval = seconds / 2592000;
    if (interval >= 1) {
      return this.formatShortDate(date, now);
    }
    
    // Semanas: > 604,800 segundos
    interval = seconds / 604800;
    if (interval >= 1) {
      return `${Math.floor(interval)} sem`;
    }

    // Días: > 86,400 segundos
    interval = seconds / 86400;
    if (interval >= 1) {
      return `${Math.floor(interval)}d`;
    }

    // Horas: > 3,600 segundos
    interval = seconds / 3600;
    if (interval >= 1) {
      return `${Math.floor(interval)}h`;
    }

    // Minutos: > 60 segundos
    interval = seconds / 60;
    if (interval >= 1) {
      return `${Math.floor(interval)}m`;
    }
    
    return 'Ahora';
  }

  /**
   * Formatea la fecha cuando ha pasado más de un mes.
   */
  private formatShortDate(date: Date, now: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    
    // Si el año es distinto, lo agregamos al formato
    if (now.getFullYear() !== date.getFullYear()) {
      options.year = 'numeric';
    }
    
    return date.toLocaleDateString('es-ES', options);
  }
}