import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchBar } from './search-bar';
import { Router } from '@angular/router';
import { Search } from '../../services/search/search';
import { SearchHistory } from '../../services/searchHistory/search-history';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;

  // Mocks
  let routerSpy: jasmine.SpyObj<Router>;
  let searchServiceSpy: jasmine.SpyObj<Search>;
  let searchHistorySpy: jasmine.SpyObj<SearchHistory>;

  const mockUsers = [{ username: 'testuser', displayName: 'Test User', avatarUrl: '' }];

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    searchServiceSpy = jasmine.createSpyObj('Search', ['searchUsers']);
    searchHistorySpy = jasmine.createSpyObj('SearchHistory', ['addContentSearch', 'addUserSearch']);

    await TestBed.configureTestingModule({
      imports: [
        SearchBar,
        ReactiveFormsModule,
        TranslateModule.forRoot(), // Para evitar errores con el pipe 'translate'
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Search, useValue: searchServiceSpy },
        { provide: SearchHistory, useValue: searchHistorySpy },
      ],
      // Ignora componentes de Material que causan problemas de bundle/animaciones
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('Búsqueda reactiva (Autocomplete)', () => {
    it('debería buscar usuarios cuando el texto empieza por @', fakeAsync(() => {
      searchServiceSpy.searchUsers.and.returnValue(of(mockUsers));

      component.searchControl.setValue('@test');
      tick(300); // Espera el debounceTime

      component.userSearchResults$.subscribe((results) => {
        expect(results).toEqual(mockUsers);
        expect(searchServiceSpy.searchUsers).toHaveBeenCalledWith('test');
      });
    }));

    it('debería devolver array vacío si no empieza por @', fakeAsync(() => {
      component.searchControl.setValue('búsqueda normal');
      tick(300);

      component.userSearchResults$.subscribe((results) => {
        expect(results).toEqual([]);
        expect(searchServiceSpy.searchUsers).not.toHaveBeenCalled();
      });
    }));
  });

  describe('Navegación', () => {
    it('debería navegar a /search al enviar una búsqueda de contenido', () => {
      component.searchControl.setValue('angular rocks');
      component.onSearchSubmit();

      expect(searchHistorySpy.addContentSearch).toHaveBeenCalledWith('angular rocks');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/search'], {
        queryParams: { q: 'angular rocks' },
      });
    });

    it('debería navegar al perfil al seleccionar un usuario del historial/autocomplete', () => {
      const user = { username: 'gemini', displayName: 'Gemini', avatarUrl: '' };
      const event = {
        option: { value: user },
      } as MatAutocompleteSelectedEvent;

      component.onUserSelected(event);

      expect(searchHistorySpy.addUserSearch).toHaveBeenCalledWith(user);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile', 'gemini']);
      expect(component.searchControl.value).toBe('');
    });
  });

  it('displayUser debería formatear correctamente el username con @', () => {
    const user = { username: 'test', displayName: 'Test', avatarUrl: '' };
    expect(component.displayUser(user)).toBe('@test');
    expect(component.displayUser(null as any)).toBe('');
  });
});
