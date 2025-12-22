import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateThreadModal } from './create-thread-modal';
import { threadService } from '../../services/thread/thread';
import { Category } from '../../services/category/category';
import { Search } from '../../services/search/search';
import { ThreadState } from '../../services/thread-state/thread-state';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

describe('CreateThreadModal', () => {
  let component: CreateThreadModal;
  let fixture: ComponentFixture<CreateThreadModal>;

  // Spies para dependencias
  let threadServiceSpy: jasmine.SpyObj<threadService>;
  let categoryServiceSpy: jasmine.SpyObj<Category>;
  let searchServiceSpy: jasmine.SpyObj<Search>;
  let threadStateSpy: jasmine.SpyObj<ThreadState>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateThreadModal>>;

  beforeEach(async () => {
    // Inicialización de Spies
    threadServiceSpy = jasmine.createSpyObj('threadService', ['createThread']);
    categoryServiceSpy = jasmine.createSpyObj('Category', ['getAllCategories']);
    searchServiceSpy = jasmine.createSpyObj('Search', ['searchUsers']);
    threadStateSpy = jasmine.createSpyObj('ThreadState', ['notifyThreadCreated']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    // Mock por defecto para categorías
    categoryServiceSpy.getAllCategories.and.returnValue(of([{
      id: 1,
      name: 'Tecnología',
      description: 'Hilos sobre tecnología',
      followersCount: 1000,
      followingCount: 500,
      followerCount: 1000,
      isFollowedByCurrentUser: false,
    }]));

    await TestBed.configureTestingModule({
      imports: [CreateThreadModal, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: threadService, useValue: threadServiceSpy },
        { provide: Category, useValue: categoryServiceSpy },
        { provide: Search, useValue: searchServiceSpy },
        { provide: ThreadState, useValue: threadStateSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateThreadModal);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  // --- PRUEBAS DE INICIALIZACIÓN ---
  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load categories on init', () => {
      expect(categoryServiceSpy.getAllCategories).toHaveBeenCalled();
      expect(component.categories.length).toBeGreaterThan(0);
      expect(component.categories[0].value).toBe('Tecnología');
    });
  });

  // --- PRUEBAS DE NAVEGACIÓN ---
  describe('Navigation', () => {
    it('should increment step on nextStep()', () => {
      component.currentStep = 1;
      component.nextStep();
      expect(component.currentStep).toBe(2);
    });

    it('should decrement step on previousStep()', () => {
      component.currentStep = 2;
      component.previousStep();
      expect(component.currentStep).toBe(1);
    });

    it('should not exceed step limits', () => {
      component.currentStep = 3;
      component.nextStep();
      expect(component.currentStep).toBe(3);

      component.currentStep = 1;
      component.previousStep();
      expect(component.currentStep).toBe(1);
    });
  });

  // --- PRUEBAS DE VALIDACIÓN Y PUBLICACIÓN ---
  describe('Publishing Logic', () => {
    it('should show error if post1 is empty and no images', () => {
      component.threads = ['', '', ''];
      component.selectedImages = [];

      component.publish();

      expect(component.errorMessage).toBe('Debes escribir algo o subir una imagen.');
      expect(threadServiceSpy.createThread).not.toHaveBeenCalled();
    });

    it('should show error if character limits are exceeded', () => {
      // Simulamos un post muy largo para el paso 1 (límite 600)
      component.threads[0] = 'a'.repeat(601);

      component.publish();

      expect(component.errorMessage).toBe('Un post excede el límite de caracteres.');
    });

    it('should call services and close modal on success', () => {
      // Arrange
      const mockResponse: any = {
        id: 100,
        author: { id: 1, username: 'dev', displayName: 'David', avatarUrl: '' },
        posts: ['Contenido del hilo'],
        createdAt: new Date().toISOString(),
        stats: { likes: 0, views: 0 },
        images: [],
      };

      component.threads = ['Contenido válido', '', ''];
      threadServiceSpy.createThread.and.returnValue(of(mockResponse));

      // Act
      component.publish();

      // Assert
      expect(threadServiceSpy.createThread).toHaveBeenCalled();
      expect(threadStateSpy.notifyThreadCreated).toHaveBeenCalledWith(
        jasmine.objectContaining({
          id: 100,
        })
      );
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should handle server error "Límite diario"', () => {
      const errorResponse = { error: { message: 'Límite diario alcanzado' } };
      threadServiceSpy.createThread.and.returnValue(throwError(() => errorResponse));

      component.threads = ['Contenido válido', '', ''];
      component.publish();

      expect(component.errorMessage).toBe('Límite diario alcanzado');
    });
  });

  // --- PRUEBAS DE IMÁGENES ---
  describe('Image Handling', () => {
    it('should add image to selectedImages on file selection', () => {
      const blob = new Blob([''], { type: 'image/png' });
      const file = blob as File;
      Object.defineProperty(file, 'name', { value: 'test.png' });
      Object.defineProperty(file, 'size', { value: 1024 });

      const event = {
        target: {
          files: [file],
          value: 'test.png',
        },
      } as any;

      component.onFileSelected(event);

      expect(component.selectedImages.length).toBe(1);
      expect(component.selectedImages[0].name).toBe('test.png');
      expect(component.errorMessage).toBeNull();
    });

    it('should show error if exceeds MAX_IMAGES', () => {
      // Llenamos el array al máximo
      component.selectedImages = [{} as File, {} as File, {} as File, {} as File];

      const file = new File([''], 'extra.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as any;

      component.onFileSelected(event);

      expect(component.errorMessage).toContain('Máximo 4 imágenes');
    });

    it('should remove image and its preview', () => {
      component.selectedImages = [new File([''], 'img1.png')];
      component.imagePreviews = ['data:image/png;base64,123'];

      component.removeImage(0);

      expect(component.selectedImages.length).toBe(0);
      expect(component.imagePreviews.length).toBe(0);
    });
  });
});
