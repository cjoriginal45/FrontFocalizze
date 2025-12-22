import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountProfile } from './count-profile';

describe('CountProfile', () => {
  let component: CountProfile;
  let fixture: ComponentFixture<CountProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
