import { TestBed } from '@angular/core/testing';

import { FollowButton } from './follow-button';

describe('FollowButton', () => {
  let service: FollowButton;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FollowButton);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
