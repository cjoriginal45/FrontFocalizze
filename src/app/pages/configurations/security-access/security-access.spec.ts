import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityAccess } from './security-access';

describe('SecurityAccess', () => {
  let component: SecurityAccess;
  let fixture: ComponentFixture<SecurityAccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityAccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityAccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
