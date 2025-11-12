import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditThreadModal } from './edit-thread-modal';

describe('EditThreadModal', () => {
  let component: EditThreadModal;
  let fixture: ComponentFixture<EditThreadModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditThreadModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditThreadModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
