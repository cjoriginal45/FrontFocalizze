import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportDetailsModal } from './report-details-modal';
import { Admin } from '../../../services/admin/admin';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportResponse } from '../../../interfaces/ReportResponse';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Component, Input, forwardRef, Directive } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

// Importación de módulos reales necesaria únicamente para la estrategia de 'overrideComponent'
// (Se usan como referencia para ser excluidos del compilado final del test)
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

// --- ESTRATEGIA DE AISLAMIENTO (UI MOCKS) ---
// Se definen versiones ligeras de los componentes de Material para:
// 1. Evitar la carga del sistema de animaciones (@angular/animations).
// 2. Acelerar la ejecución de las pruebas.
// 3. Eliminar dependencias complejas del DOM.

@Component({
  selector: 'mat-icon',
  template: '<span>icon</span>',
  standalone: true,
})
class MockMatIcon {}

@Component({
  selector: 'mat-form-field',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatFormField {}

@Component({
  selector: 'mat-label',
  template: '<ng-content></ng-content>',
  standalone: true,
})
class MockMatLabel {}

/**
 * MockMatSelect: Implementación Especial
 * Implementa `ControlValueAccessor` para ser compatible con `[(ngModel)]`.
 * Soluciona el error NG01203 permitiendo que Angular reconozca este componente
 * como un control de formulario válido.
 */
@Component({
  selector: 'mat-select',
  template: '<div>Mock Select</div>',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockMatSelect),
      multi: true,
    },
  ],
})
class MockMatSelect implements ControlValueAccessor {
  @Input() disabled: boolean = false;

  // Métodos requeridos por la interfaz CVA (No-Op para testing)
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

@Component({
  selector: 'mat-option',
  template: '<div>Option</div>',
  standalone: true,
})
class MockMatOption {
  @Input() value: any;
}

/**
 * MockMatDialogClose
 * Captura la directiva `mat-dialog-close` en los botones para verificar
 * el retorno de valores sin depender de la lógica interna del diálogo real.
 */
@Directive({
  selector: '[mat-dialog-close]',
  standalone: true,
})
class MockMatDialogClose {
  @Input('mat-dialog-close') dialogResult: any;
}

// --- TEST SUITE ---

describe('ReportDetailsModal', () => {
  let component: ReportDetailsModal;
  let fixture: ComponentFixture<ReportDetailsModal>;

  // Spies para dependencias inyectadas
  let adminServiceSpy: jasmine.SpyObj<Admin>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ReportDetailsModal>>;

  const mockReport: ReportResponse = {
    id: 123,
    reportedUsername: 'badUser',
    reportedAvatarUrl: 'https://example.com/bad.png',
    reporterUsername: 'goodUser',
    reporterAvatarUrl: 'https://example.com/good.png',
    reason: 'SPAM',
    description: 'Sending spam messages',
    createdAt: '2025-01-01',
  };

  beforeEach(async () => {
    // Configuración de Spies
    adminServiceSpy = jasmine.createSpyObj('Admin', ['processReport']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        ReportDetailsModal,
        FormsModule, // Requerido para [(ngModel)]
      ],
      providers: [
        { provide: Admin, useValue: adminServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockReport },
      ],
    })
      // COMPONENT OVERRIDE:
      // Reemplaza los imports reales del componente standalone por nuestros Mocks.
      // Esto elimina conflictos de directivas y errores de animaciones.
      .overrideComponent(ReportDetailsModal, {
        remove: {
          imports: [
            MatDialogModule,
            MatIconModule,
            MatFormFieldModule,
            MatSelectModule,
            MatButtonModule,
          ],
        },
        add: {
          imports: [
            MockMatIcon,
            MockMatFormField,
            MockMatLabel,
            MockMatSelect,
            MockMatOption,
            MockMatDialogClose,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReportDetailsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization & Rendering', () => {
    it('should display report details correctly from injected data', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('badUser');
      expect(compiled.textContent).toContain('goodUser');
      expect(compiled.textContent).toContain('SPAM');
    });

    it('should initialize reactive signals with default values', () => {
      expect(component.selectedDays()).toBe(1);
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('Interactions - Business Logic', () => {
    it('should handle dismiss action: call service, show snackbar, and close dialog', () => {
      // Arrange
      adminServiceSpy.processReport.and.returnValue(of(void 0));

      // Act
      component.dismissReport();

      // Assert
      expect(component.isLoading()).toBeFalse(); // Verifica reset de loading
      expect(adminServiceSpy.processReport).toHaveBeenCalledWith(123, 'DISMISS', undefined);
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Reporte ignorado.',
        jasmine.any(String),
        jasmine.any(Object)
      );
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('should handle errors gracefully during dismiss action', () => {
      // Arrange
      adminServiceSpy.processReport.and.returnValue(throwError(() => new Error('Network error')));
      spyOn(console, 'error'); // Supress console error noise

      // Act
      component.dismissReport();

      // Assert
      expect(component.isLoading()).toBeFalse();
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Error al procesar.',
        jasmine.any(String),
        jasmine.any(Object)
      );
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should handle suspend action: pass selected days to service', () => {
      // Arrange
      adminServiceSpy.processReport.and.returnValue(of(void 0));
      component.selectedDays.set(7); // Simulamos interacción de usuario
      fixture.detectChanges();

      // Act
      component.suspendUser();

      // Assert
      expect(adminServiceSpy.processReport).toHaveBeenCalledWith(123, 'SUSPEND', 7);
      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Usuario suspendido.',
        jasmine.any(String),
        jasmine.any(Object)
      );
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });
  });

  describe('UI State Management', () => {
    it('should disable interaction buttons while loading is active', () => {
      // Act
      component.isLoading.set(true);
      fixture.detectChanges();

      // Assert
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const secondaryBtn = buttons.find((b) => b.nativeElement.classList.contains('btn-secondary'));
      const warnBtn = buttons.find((b) => b.nativeElement.classList.contains('btn-warn'));

      expect(secondaryBtn?.nativeElement.disabled).toBeTrue();
      expect(warnBtn?.nativeElement.disabled).toBeTrue();
    });
  });
});
