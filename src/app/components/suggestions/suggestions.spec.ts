import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Suggestions } from './suggestions';
import { Category } from '../../services/category/category';
import { CategoryState } from '../../services/category-state/category-state';
import { of, throwError } from 'rxjs';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryInterface } from '../../interfaces/CategoryInterface';

describe('Suggestions', () => {
  let component: Suggestions;
  let fixture: ComponentFixture<Suggestions>;

  // Mocks de servicios
  let categoryServiceSpy: jasmine.SpyObj<Category>;
  let categoryStateSpy: jasmine.SpyObj<CategoryState>;

  const mockCategories: CategoryInterface[] = [
    {
      id: 1,
      name: 'Angular',
      description: 'Desc',
      followerCount: 10,
      isFollowedByCurrentUser: false,
    },
    { id: 2, name: 'React', description: 'Desc', followerCount: 20, isFollowedByCurrentUser: true },
    { id: 3, name: 'Vue', description: 'Desc', followerCount: 5, isFollowedByCurrentUser: false },
    {
      id: 4,
      name: 'Ninguna',
      description: 'Ocultar',
      followerCount: 0,
      isFollowedByCurrentUser: false,
    },
  ];

  beforeEach(async () => {
    categoryServiceSpy = jasmine.createSpyObj('Category', ['getAllCategories']);
    categoryStateSpy = jasmine.createSpyObj('CategoryState', [
      'getCategorySignal',
      'loadCategories',
    ]);

    await TestBed.configureTestingModule({
      imports: [Suggestions, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Category, useValue: categoryServiceSpy },
        { provide: CategoryState, useValue: categoryStateSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
      // Evita errores con MatIcon y SuggestionItem (y sus animaciones)
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Suggestions);
    component = fixture.componentInstance;
  });

  it('debería crearse el componente', () => {
    categoryServiceSpy.getAllCategories.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Carga de Categorías', () => {
    it('debería cargar categorías filtrando "Ninguna" y guardarlas en el estado', () => {
      categoryServiceSpy.getAllCategories.and.returnValue(of(mockCategories));

      component.ngOnInit();

      // Debería filtrar 'Ninguna', quedan 3 categorías
      expect(categoryStateSpy.loadCategories).toHaveBeenCalledWith(
        jasmine.arrayContaining([jasmine.objectContaining({ name: 'Angular' })])
      );
      expect(categoryStateSpy.loadCategories).not.toHaveBeenCalledWith(
        jasmine.arrayContaining([jasmine.objectContaining({ name: 'Ninguna' })])
      );
    });

    it('debería manejar errores de carga en consola', () => {
      const consoleSpy = spyOn(console, 'error');
      categoryServiceSpy.getAllCategories.and.returnValue(throwError(() => new Error('API Error')));

      component.loadCategories();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error al cargar las categorías de sugerencias',
        jasmine.any(Error)
      );
    });
  });

  describe('Lógica de Ordenamiento (Computed Signals)', () => {
    it('debería ordenar categorías: primero no seguidas (alfabético) y luego seguidas', () => {
      categoryServiceSpy.getAllCategories.and.returnValue(of(mockCategories));

      // Configuramos el mock para devolver señales individuales cuando el computed las pida
      categoryStateSpy.getCategorySignal.and.callFake((id: number) => {
        const cat = mockCategories.find((c) => c.id === id);
        return cat ? signal(cat) : undefined;
      });

      fixture.detectChanges(); // Ejecuta ngOnInit y carga categorías

      const sortedIds = component.sortedCategoryIds();

      // Angular (id:1, no seguida) y Vue (id:3, no seguida) deberían ir antes que React (id:2, seguida)
      // Entre Angular y Vue, Angular va primero por orden alfabético
      expect(sortedIds[0]).toBe(1); // Angular
      expect(sortedIds[1]).toBe(3); // Vue
      expect(sortedIds[2]).toBe(2); // React
    });
  });

  describe('UI Toggles', () => {
    it('debería alternar el panel móvil', () => {
      expect(component.isMobilePanelOpen).toBeFalse();
      component.toggleMobilePanel();
      expect(component.isMobilePanelOpen).toBeTrue();
    });

    it('debería alternar ver todas las categorías', () => {
      expect(component.showAllCategories).toBeFalse();
      component.toggleShowAllCategories();
      expect(component.showAllCategories).toBeTrue();
    });
  });
});
