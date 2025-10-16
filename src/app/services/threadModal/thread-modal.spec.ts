import { TestBed } from '@angular/core/testing';

import { ThreadModal } from './thread-modal';

describe('ThreadModal', () => {
  let service: ThreadModal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThreadModal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
