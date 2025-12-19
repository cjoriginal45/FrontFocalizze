import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EditProfileModal, EditProfileResponse } from './edit-profile-modal';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { ProfileInterface } from '../../../interfaces/ProfileInterface';

describe('EditProfileModal', () => {
  let component: EditProfileModal;
  let fixture: ComponentFixture<EditProfileModal>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditProfileModal>>;

  const mockProfile: ProfileInterface = {
    id: 1,
    username: 'johndoe',
    displayName: 'John Doe',
    biography: 'Hello world',
    avatarUrl: 'http://example.com/avatar.jpg',
    followersCount: 0,
    followingCount: 0,
    followers: 0,
    follow: 0,
    threadCount: 0,
    threadsAvailableToday: null,
    registerDate: '',
    isFollowing: false
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        EditProfileModal,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { profile: mockProfile } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfileModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with profile data', () => {
    // Arrange & Act (done in beforeEach)
    // Assert
    expect(component.profileForm.controls.displayName.value).toBe(mockProfile.displayName);
    expect(component.profileForm.controls.biography.value).toBe(mockProfile.biography);
    expect(component.imagePreview).toBe(mockProfile.avatarUrl);
  });

  it('should close the dialog when closeModal is called', () => {
    // Act
    component.closeModal();
    // Assert
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should call onSave and return data if form is valid', () => {
    // Arrange
    const newName = 'John Updated';
    component.profileForm.controls.displayName.setValue(newName);
    
    // Act
    component.onSave();

    // Assert
    const expectedResponse: EditProfileResponse = {
      formData: { displayName: newName, biography: mockProfile.biography },
      file: null
    };
    expect(dialogRefSpy.close).toHaveBeenCalledWith(expectedResponse);
  });

  it('should handle file selection and update image preview', fakeAsync(() => {
    // Arrange
    const blob = new Blob([''], { type: 'image/png' });
    const file = new File([blob], 'test-avatar.png');
    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    // Act
    component.onFileSelected(event);
    tick(); // Esperar al FileReader
    fixture.detectChanges();

    // Assert
    expect(component.selectedFile).toBe(file);
    expect(component.imagePreview).not.toBeNull();
  }));

  it('should disable save button if display name exceeds 50 characters', () => {
    // Arrange
    component.profileForm.controls.displayName.setValue('a'.repeat(51));
    fixture.detectChanges();

    // Act
    const saveButton = fixture.debugElement.query(By.css('.save-button')).nativeElement;

    // Assert
    expect(saveButton.disabled).toBeTrue();
  });
});