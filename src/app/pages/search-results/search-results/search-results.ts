import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Thread } from '../../../components/thread/thread';
import { ActivatedRoute, Router } from '@angular/router';
import { Search } from '../../../services/search/search';
import { FeedThreadDto } from '../../../interfaces/FeedThread';
import { switchMap } from 'rxjs';
import { ThreadResponse } from '../../../interfaces/ThreadResponseDto';
import { UserInterface } from '../../../interfaces/UserInterface';
import { Header } from "../../../components/header/header";
import { FollowingDiscovering } from "../../../components/following-discovering/following-discovering";

@Component({
  selector: 'app-search-results',
  imports: [CommonModule, MatIconModule, MatButtonModule, Thread, Header, FollowingDiscovering],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResults implements OnInit  {
  private route = inject(ActivatedRoute);
  private searchService = inject(Search);
  private router = inject(Router); 

    // --- Propiedades de Estado ---
    threads: FeedThreadDto[] = [];
    query = '';
    isLoading = true;


    ngOnInit(): void {
      // Nos suscribimos a los cambios en los parámetros de la URL.
      this.route.queryParamMap.pipe(
        // Usamos switchMap para cancelar peticiones anteriores si la búsqueda cambia rápidamente.
        switchMap(params => {
          this.isLoading = true;
          this.threads = []; // Limpiamos resultados anteriores
          this.query = params.get('q') || ''; // Obtenemos el término de búsqueda
  
          if (this.query) {
            // Si hay una query, llamamos al servicio de búsqueda.
            return this.searchService.searchContent(this.query);
          }
          // Si no hay query, devolvemos un array vacío.
          return [];
        })
      ).subscribe({
        next: (results) => {
          // Mapeamos los resultados de la API al modelo de vista.
          this.threads = results.map(dto => this.mapDtoToViewModel(dto));
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al buscar contenido', err);
          this.isLoading = false;
        }
      });
    }

    /**
   * Navega a la página anterior en el historial del navegador.
   */
  goBack(): void {
    // Una forma simple de volver atrás. Podríamos usar Location service también.
    this.router.navigate(['/home']); // O simplemente `window.history.back();`
  }
  
  /**
   * Convierte el DTO de la API (ThreadResponse) al Modelo de Vista (FeedThreadDto).
   */
  private mapDtoToViewModel(dto: ThreadResponse): FeedThreadDto {
    // Verificación defensiva para evitar errores si llega un DTO nulo o malformado
    if (!dto || !dto.author) {
      // Si los datos son inválidos, devolvemos un objeto 'fantasma' para no romper la UI
      // y mostramos una advertencia en la consola para depuración.
      console.warn('Se recibió un DTO de hilo inválido o sin autor:', dto);
      return {
        id: dto?.id || -1,
        user: { id: -1, username: 'unknown', displayName: 'Usuario Desconocido', avatarUrl: 'assets/images/default-avatar.png' },
        publicationDate: new Date().toISOString(),
        posts: ['Error al cargar el contenido de este hilo.'],
        stats: { likes: 0, comments: 0, saves: 0, views: 0 },
        isLiked: false,
        isSaved: false,
      };
    }
    
    // Si los datos son válidos, procedemos con el mapeo.
    return {
      // ---- Mapeo Directo ----
      id: dto.id,
      posts: dto.posts,
      stats: dto.stats,
  
      // ---- Mapeo con Renombramiento y Lógica ----
      
      // Renombramos 'author' a 'user'. El tipo UserInterface ya coincide.
      // Añadimos un fallback para el avatar por si viene nulo.
      user: {
        ...dto.author,
        avatarUrl: dto.author.avatarUrl || 'assets/images/default-avatar.png'
      },
  
      // Renombramos 'createdAt' a 'publicationDate'. El tipo 'string' ya coincide.
      publicationDate: dto.createdAt,
  
      // ---- Mapeo con Valores por Defecto para el Estado de la UI ----
      
      // El backend no nos dice si nos gusta o lo hemos guardado en esta llamada,
      // así que inicializamos estos valores a 'false'.
      isLiked: false,
      isSaved: false,
    };

  }

}
