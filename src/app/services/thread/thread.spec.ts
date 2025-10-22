import { TestBed } from '@angular/core/testing';

import { Thread } from './thread';

describe('Thread', () => {
  let service: Thread;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Thread);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
