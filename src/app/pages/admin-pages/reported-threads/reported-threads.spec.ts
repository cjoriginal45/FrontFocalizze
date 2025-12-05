import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportedThreads } from './reported-threads';

describe('ReportedThreads', () => {
  let component: ReportedThreads;
  let fixture: ComponentFixture<ReportedThreads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportedThreads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportedThreads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
