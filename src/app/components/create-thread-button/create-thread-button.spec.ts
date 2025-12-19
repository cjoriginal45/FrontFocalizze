import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateThreadButton } from './create-thread-button';
import { ThreadModal } from '../../services/threadModal/thread-modal';
import { Auth } from '../../services/auth/auth';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('CreateThreadButton', () => {
  let component: CreateThreadButton;
  let fixture: ComponentFixture<CreateThreadButton>;
  
  // Definición de Mocks
  let threadModalSpy: jasmine.SpyObj<ThreadModal>;
  let authServiceSpy: jasmine.SpyObj<Auth>;

  // Signal para controlar el estado de login en los tests
  const isLoggedInSignal = signal<boolean>(false);

  beforeEach(async () => {
    // Arrange: Mocking de dependencias
    threadModalSpy = jasmine.createSpyObj('ThreadModal', ['openCreateThreadModal']);
    authServiceSpy = jasmine.createSpyObj('Auth', ['isLoggedIn'], {
      isLoggedIn: isLoggedInSignal // Mockeamos isLoggedIn como un Signal
    });

    await TestBed.configureTestingModule({
      imports: [CreateThreadButton],
      providers: [
        { provide: ThreadModal, useValue: threadModalSpy },
        { provide: Auth, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateThreadButton);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).withContext('El componente debería instanciarse correctamente').toBeTruthy();
  });

  it('should NOT render the button if user is NOT logged in', () => {
    // Arrange
    isLoggedInSignal.set(false);

    // Act
    fixture.detectChanges();

    // Assert
    const container = fixture.debugElement.query(By.css('.create-thread-container'));
    expect(container).withContext('El botón no debe estar en el DOM si no hay login').toBeNull();
  });

  it('should render the button if user IS logged in', () => {
    // Arrange
    isLoggedInSignal.set(true);

    // Act
    fixture.detectChanges();

    // Assert
    const container = fixture.debugElement.query(By.css('.create-thread-container'));
    expect(container).withContext('El botón debe ser visible cuando el usuario está logueado').not.toBeNull();
  });

  it('should call modalService.openCreateThreadModal when the button is clicked', () => {
    // Arrange
    isLoggedInSignal.set(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));

    // Act
    button.nativeElement.click();

    // Assert
    expect(threadModalSpy.openCreateThreadModal).withContext('Debería llamarse al servicio del modal al hacer click').toHaveBeenCalledTimes(1);
  });
});