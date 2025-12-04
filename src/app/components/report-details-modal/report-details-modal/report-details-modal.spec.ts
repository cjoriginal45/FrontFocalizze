import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDetailsModal } from './report-details-modal';

describe('ReportDetailsModal', () => {
  let component: ReportDetailsModal;
  let fixture: ComponentFixture<ReportDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDetailsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportDetailsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
