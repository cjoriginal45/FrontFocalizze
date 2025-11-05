import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog } from './mat-dialog';

describe('MatDialog', () => {
  let component: MatDialog;
  let fixture: ComponentFixture<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
