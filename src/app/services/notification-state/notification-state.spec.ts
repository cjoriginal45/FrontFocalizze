import { TestBed } from '@angular/core/testing';

import { NotificationState } from './notification-state';

describe('NotificationState', () => {
  let service: NotificationState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
