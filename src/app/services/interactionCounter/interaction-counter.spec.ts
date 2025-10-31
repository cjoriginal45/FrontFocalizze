import { TestBed } from '@angular/core/testing';

import { InteractionCounter } from './interaction-counter';

describe('InteractionCounter', () => {
  let service: InteractionCounter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionCounter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
