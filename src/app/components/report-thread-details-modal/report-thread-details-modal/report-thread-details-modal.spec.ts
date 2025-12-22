import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportThreadDetailsModal } from './report-thread-details-modal';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { threadService } from '../../../services/thread/thread';
import { Admin } from '../../../services/admin/admin';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ReportThreadDetailsModal', () => {
  let component: ReportThreadDetailsModal;
  let fixture: ComponentFixture<ReportThreadDetailsModal>;

  let adminServiceSpy: jasmine.SpyObj<Admin>;
  let threadServiceSpy: jasmine.SpyObj<threadService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ReportThreadDetailsModal>>;

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('Admin', ['processThreadReport']);
    threadServiceSpy = jasmine.createSpyObj('threadService', ['getThreadById']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      // 1. IMPORTANTE: NO importamos NoopAnimationsModule aquí.
      imports: [ReportThreadDetailsModal],
      providers: [
        { provide: Admin, useValue: adminServiceSpy },
        { provide: threadService, useValue: threadServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { id: 1, reportedThreadId: 100 } },
      ],
      // 2. Usamos NO_ERRORS_SCHEMA para que ignore componentes de Material como
      // <mat-progress-spinner> que requieren animaciones para compilar.
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportThreadDetailsModal);
    component = fixture.componentInstance;

    // Mock por defecto para evitar errores en ngOnInit
    threadServiceSpy.getThreadById.and.returnValue(of({ posts: [] } as any));
  });

  it('debería crearse el componente (ignora animaciones)', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Acciones del Administrador', () => {
    it('debería ejecutar DISMISS sin disparar lógica de animaciones', () => {
      adminServiceSpy.processThreadReport.and.returnValue(of(undefined));
      fixture.detectChanges();

      component.dismissReport();

      expect(adminServiceSpy.processThreadReport).toHaveBeenCalledWith(1, 'DISMISS', undefined);
      // El snackbar está mockeado, así que no intentará renderizar nada
      expect(snackBarSpy.open).toHaveBeenCalled();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });

    it('debería guardar ediciones correctamente', () => {
      adminServiceSpy.processThreadReport.and.returnValue(of(undefined));
      fixture.detectChanges();

      component.post1Content = 'Edit';
      component.saveEdits();

      expect(adminServiceSpy.processThreadReport).toHaveBeenCalledWith(1, 'EDIT', ['Edit', '', '']);
    });
  });
});
