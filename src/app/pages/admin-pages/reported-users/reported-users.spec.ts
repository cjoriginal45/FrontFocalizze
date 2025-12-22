import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportedUsers } from './reported-users';

describe('ReportedUsers', () => {
  let component: ReportedUsers;
  let fixture: ComponentFixture<ReportedUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportedUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportedUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
