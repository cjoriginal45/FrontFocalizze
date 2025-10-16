import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateThreadButton } from './create-thread-button';

describe('CreateThreadButton', () => {
  let component: CreateThreadButton;
  let fixture: ComponentFixture<CreateThreadButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateThreadButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateThreadButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
