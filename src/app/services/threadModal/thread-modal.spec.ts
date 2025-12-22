import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ThreadModal } from './thread-modal';
import { CreateThreadModal } from '../../components/create-thread-modal/create-thread-modal';

describe('ThreadModal', () => {
  let service: ThreadModal;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    // Creamos un mock de MatDialog para interceptar la llamada a .open()
    const spy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [ThreadModal, { provide: MatDialog, useValue: spy }],
    });

    service = TestBed.inject(ThreadModal);
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('debería crearse correctamente el servicio del modal', () => {
    expect(service).toBeTruthy();
  });

  it('debería abrir el modal CreateThreadModal con la configuración de estilo correcta', () => {
    service.openCreateThreadModal();

    // Verificamos que se llamó a open con los parámetros exactos definidos en el servicio
    expect(dialogSpy.open).toHaveBeenCalledWith(CreateThreadModal, {
      width: '90%',
      maxWidth: '600px',
      panelClass: 'create-thread-modal-panel',
      autoFocus: false,
    });
  });
});
