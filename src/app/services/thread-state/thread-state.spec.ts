import { TestBed } from '@angular/core/testing';

import { ThreadState } from './thread-state';

describe('ThreadState', () => {
  let service: ThreadState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreadState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
