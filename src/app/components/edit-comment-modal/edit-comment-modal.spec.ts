import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCommentModal } from './edit-comment-modal';

describe('EditCommentModal', () => {
  let component: EditCommentModal;
  let fixture: ComponentFixture<EditCommentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCommentModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCommentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
