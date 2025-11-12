import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  
  transform(value: string | Date | null | undefined): string {
    // Guarda de seguridad: si el valor es nulo o indefinido, devuelve una cadena vacía.
    if (!value) {
      return '';
    }

    // Asegurarse de que estamos trabajando con un objeto Date de JavaScript.
    const date = new Date(value);
    // Obtener la hora actual.
    const now = new Date();
    
    // Calcular la diferencia en segundos.
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // --- LÓGICA DE INTERVALOS ---

    // Intervalo de 1 año (aproximadamente 31,536,000 segundos)
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + 'a'; // 'a' para años
    }

    // Intervalo de 1 mes (aproximadamente 2,592,000 segundos)
    interval = seconds / 2592000;
    if (interval > 1) {
      // Si ha pasado más de un mes, simplemente mostramos la fecha en formato corto.
      // Ej: "15 nov" o "23 dic 2024"
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      if (now.getFullYear() !== date.getFullYear()) {
        options.year = 'numeric';
      }
      return date.toLocaleDateString('es-ES', options);
    }
    
    // Intervalo de 1 semana (604,800 segundos)
    interval = seconds / 604800;
    if (interval > 1) {
      return Math.floor(interval) + ' sem';
    }

    // Intervalo de 1 día (86,400 segundos)
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + 'd';
    }

    // Intervalo de 1 hora (3,600 segundos)
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + 'h';
    }

    // Intervalo de 1 minuto (60 segundos)
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + 'm';
    }
    
    // Si ha pasado menos de un minuto
    return 'Ahora';
  }
}
