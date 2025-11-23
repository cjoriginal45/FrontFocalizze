import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyBlocking } from './privacy-blocking';

describe('PrivacyBlocking', () => {
  let component: PrivacyBlocking;
  let fixture: ComponentFixture<PrivacyBlocking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyBlocking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyBlocking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
