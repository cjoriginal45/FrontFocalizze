import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { Register } from './register';
import { RegisterService } from '../../services/registerService/register';
import { Router } from '@angular/router';
import { RegisterResponse } from '../../interfaces/RegisterResponse';
import { of, throwError } from 'rxjs';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let registerService: jasmine.SpyObj<RegisterService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const registerServiceSpy = jasmine.createSpyObj('RegisterService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: RegisterService, useValue: registerServiceSpy },
        { provide: Router, useValue: routerSpy },

        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    registerService = TestBed.inject(RegisterService) as jasmine.SpyObj<RegisterService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  /**
   * Prueba: Creación del componente
   * Verifica que el componente se crea correctamente
   *
   * Test: Creating the component
   * Verify that the component is created correctly
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
