import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowersFollowingModal } from './followers-following-modal';

describe('FollowersFollowingModal', () => {
  let component: FollowersFollowingModal;
  let fixture: ComponentFixture<FollowersFollowingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowersFollowingModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowersFollowingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
