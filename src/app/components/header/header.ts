import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MenuService } from '../../services/menuService/menu';
import { Menu } from '../menu/menu';
import { debounceTime, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { Responsive } from '../../services/responsive/responsive';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { UserSearch } from '../../interfaces/UserSearch';
import { Search } from '../../services/search/search';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    Menu,
    ReactiveFormsModule,
    MatAutocompleteModule     
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit{
  // @ViewChild apunta a MenuComponent
  // @ViewChild points to MenuComponent
  @ViewChild(Menu) public menuComponent!: Menu;

  public isMobile$: Observable<boolean>;

  
  // FormControl para el input de búsqueda
  searchControl = new FormControl('');
  
  // Observable para los resultados de la búsqueda de usuarios
  userSearchResults$!: Observable<UserSearch[]>;

  constructor(
    private responsiveService: Responsive,
    private router: Router,
    private searchService: Search) {
    this.isMobile$ = this.responsiveService.isMobile$;
  }
  ngOnInit(): void {
    this.userSearchResults$ = this.searchControl.valueChanges.pipe(
      // 1. Espera 300ms después de que el usuario deja de teclear
      debounceTime(300),
      // 2. Solo emite si el valor ha cambiado realmente
      distinctUntilChanged(),
      // 3. Procesa el valor
      switchMap(value => {
        const query = value || '';
        // 4. Si el texto empieza con '@' y tiene más de 1 carácter, llama a la API
        if (query.startsWith('@') && query.length > 1) {
          return this.searchService.searchUsers(query);
        }
        // 5. En cualquier otro caso, devuelve un observable con un array vacío
        return of([]);
      })
    );
  }

    // Se ejecuta cuando el usuario presiona Enter en el campo de búsqueda
    onSearchSubmit(event: Event): void {
      event.preventDefault();
      const query = this.searchControl.value?.trim() || '';
      
      // Solo navegamos si hay una query y no es una búsqueda de usuario
      if (query && !query.startsWith('@')) {
        console.log('Realizando búsqueda de contenido para:', query);
        
        // --- NAVEGACIÓN A LA PÁGINA DE RESULTADOS ---
        this.router.navigate(['/feed'], { queryParams: { q: query } });
      }
    }


     // Se ejecuta cuando el usuario selecciona una opción del autocompletado
  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const username = event.option.value;
    // Navega al perfil del usuario seleccionado
    this.router.navigate(['/profile', username]);
    // Limpia el campo de búsqueda después de la selección
    this.searchControl.setValue('');
  }

  // Función para que el autocompletado muestre el displayName pero guarde el username
  displayUser(user: UserSearch): string {
    return user ? `@${user.username}` : '';
  }

  onMenuClick(): void {
    // Llamamos al método toggle() de nuestra referencia a MenuComponent
    // We call the toggle() method of our MenuComponent reference
    this.menuComponent.toggle();
  }
}
