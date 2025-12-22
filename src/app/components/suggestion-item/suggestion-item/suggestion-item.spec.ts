import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuggestionItem } from './suggestion-item';
import { CategoryState } from '../../../services/category-state/category-state';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryInterface } from '../../../interfaces/CategoryInterface';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
// --- IMPORTANTE: Añadimos TranslateModule ---
import { TranslateModule } from '@ngx-translate/core';

describe('SuggestionItem', () => {
  let component: SuggestionItem;
  let fixture: ComponentFixture<SuggestionItem>;

  let categoryStateSpy: jasmine.SpyObj<CategoryState>;

  const mockCategory: CategoryInterface = {
    id: 1,
    name: 'Tecnología',
    description: 'Todo sobre tech',
    followerCount: 150,
    isFollowedByCurrentUser: false,
  };

  beforeEach(async () => {
    categoryStateSpy = jasmine.createSpyObj('CategoryState', ['getCategorySignal']);

    await TestBed.configureTestingModule({
      imports: [
        SuggestionItem,
        // Provee el TranslateService para evitar el error NG0201
        TranslateModule.forRoot(),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CategoryState, useValue: categoryStateSpy },
        { provide: ActivatedRoute, useValue: {} },
      ],
      // Mantenemos NO_ERRORS_SCHEMA para evitar errores de bundle de animaciones
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestionItem);
    component = fixture.componentInstance;
  });

  it('debería crearse el componente correctamente', () => {
    // Simulamos los datos necesarios para que el componente no explote al iniciar
    component.categoryId = 1;
    categoryStateSpy.getCategorySignal.and.returnValue(signal(mockCategory));

    fixture.detectChanges(); // Ejecuta ngOnInit
    expect(component).toBeTruthy();
  });

  describe('Integración con el Estado', () => {
    it('debería obtener y vincular la señal de la categoría', () => {
      const categorySignal = signal(mockCategory);
      categoryStateSpy.getCategorySignal.and.returnValue(categorySignal);

      component.categoryId = 1;
      component.ngOnInit();

      expect(categoryStateSpy.getCategorySignal).toHaveBeenCalledWith(1);
      expect(component.categorySignal!()).toEqual(mockCategory);
    });
  });
});
