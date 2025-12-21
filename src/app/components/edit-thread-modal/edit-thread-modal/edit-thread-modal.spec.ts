import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditThreadModal } from './edit-thread-modal';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category } from '../../../services/category/category';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

describe('EditThreadModal', () => {
  let component: EditThreadModal;
  let fixture: ComponentFixture<EditThreadModal>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<EditThreadModal>>;
  let mockCategoryService: jasmine.SpyObj<Category>;

  const mockThreadData = {
    thread: {
      posts: ['Post 1', 'Post 2', 'Post 3'],
      categoryName: 'Tech',
      id: 1,
      publicationDate: new Date().toISOString(),
      user: { username: 'testuser', avatarUrl: '', displayName: '' },
      stats: { likes: 0, reposts: 0, comments: 0, views: 0 },
      isLiked: false,
      isSaved: false,
      images: []
    }
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockCategoryService = jasmine.createSpyObj('Category', ['getAllCategories']);

    // Default mock response
    mockCategoryService.getAllCategories.and.returnValue(of([{ 
      id: 1, 
      name: 'Tech',
      description: 'Technology related',
      followerCount: 100,
      isFollowedByCurrentUser: false
    }]));

    await TestBed.configureTestingModule({
      imports: [
        EditThreadModal,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockThreadData },
        { provide: Category, useValue: mockCategoryService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditThreadModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize with dialog data', () => {
    // Assert
    expect(component).toBeTruthy();
    expect(component.threads()).toEqual(['Post 1', 'Post 2', 'Post 3']);
    expect(component.selectedCategory()).toBe('Tech');
  });

  it('should load categories on init', () => {
    // Assert
    expect(mockCategoryService.getAllCategories).toHaveBeenCalled();
    expect(component.categories().length).toBe(1);
    expect(component.categories()[0].value).toBe('Tech');
  });

  it('should handle category load error gracefully', () => {
    // Arrange
    mockCategoryService.getAllCategories.and.returnValue(throwError(() => new Error('API Error')));
    
    // Act
    (component as any).loadCategories();
    
    // Assert
    expect(component.categories()).toEqual([]);
  });

  it('should update step when nextStep is called', () => {
    // Act
    component.nextStep();
    // Assert
    expect(component.currentStep()).toBe(2);
  });

  it('should call dialogRef.close with updated data onSave', () => {
    // Act
    component.updateThread(0, 'Updated Post 1');
    component.onSave();

    // Assert
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      post1: 'Updated Post 1',
      post2: 'Post 2',
      post3: 'Post 3',
      categoryName: 'Tech'
    });
  });

  it('should set error message if first post is empty onSave', () => {
    // Act
    component.updateThread(0, '');
    component.onSave();

    // Assert
    expect(component.errorMessage()).toBe('El primer post no puede estar vacío');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog when closeModal is called', () => {
    // Act
    component.closeModal();
    // Assert
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});