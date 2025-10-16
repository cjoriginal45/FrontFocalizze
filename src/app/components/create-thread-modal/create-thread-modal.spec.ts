import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateThreadModal } from './create-thread-modal';

describe('CreateThreadModal', () => {
  let component: CreateThreadModal;
  let fixture: ComponentFixture<CreateThreadModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateThreadModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateThreadModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
