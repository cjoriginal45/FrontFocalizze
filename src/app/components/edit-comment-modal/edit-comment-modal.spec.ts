import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCommentModal } from './edit-comment-modal';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

describe('EditCommentModal', () => {
  let component: EditCommentModal;
  let fixture: ComponentFixture<EditCommentModal>;
  
  // Spies para dependencias
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditCommentModal>>;
  const mockData = { content: 'Contenido original' };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        EditCommentModal, 
        NoopAnimationsModule, 
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditCommentModal);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Ejecuta ngOnInit
  });

  it('should create the component', () => {
    expect(component).withContext('El componente debería instanciarse').toBeTruthy();
  });

  it('should initialize the form with data from MAT_DIALOG_DATA', () => {
    // Assert
    expect(component.contentControl.value).toBe(mockData.content);
  });

  it('should close the dialog with NO value when onCancel is called', () => {
    // Act
    component.onCancel();

    // Assert
    expect(dialogRefSpy.close).withContext('Debería cerrar sin parámetros').toHaveBeenCalledWith();
  });

  it('should close the dialog with NEW value when onSave is called and form is valid', () => {
    // Arrange
    const newValue = 'Comentario editado con éxito';
    component.contentControl.setValue(newValue);
    component.contentControl.markAsDirty();

    // Act
    component.onSave();

    // Assert
    expect(dialogRefSpy.close).withContext('Debería retornar el nuevo contenido').toHaveBeenCalledWith(newValue);
  });

  it('should disable Save button if content is empty or not modified (pristine)', () => {
    // Arrange
    fixture.detectChanges();
    const saveButton = fixture.debugElement.query(By.css('.btn-save')).nativeElement;

    // Assert: Al inicio es pristine (no tocado), debe estar deshabilitado
    expect(saveButton.disabled).withContext('Botón debe estar deshabilitado inicialmente').toBeTrue();

    // Act: Modificamos pero dejamos vacío
    component.contentControl.setValue('');
    component.contentControl.markAsDirty();
    fixture.detectChanges();

    // Assert
    expect(saveButton.disabled).withContext('Botón debe estar deshabilitado si está vacío').toBeTrue();
  });

  it('should enable Save button only when valid and modified', () => {
    // Act
    component.contentControl.setValue('Nuevo texto');
    component.contentControl.markAsDirty();
    fixture.detectChanges();
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save')).nativeElement;

    // Assert
    expect(saveButton.disabled).withContext('Botón debe habilitarse con cambios válidos').toBeFalse();
  });
});