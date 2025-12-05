import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportThreadDetailsModal } from './report-thread-details-modal';

describe('ReportThreadDetailsModal', () => {
  let component: ReportThreadDetailsModal;
  let fixture: ComponentFixture<ReportThreadDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportThreadDetailsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportThreadDetailsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
