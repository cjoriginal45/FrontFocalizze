import { TestBed } from '@angular/core/testing';

import { ViewTracking } from './view-tracking';

describe('ViewTracking', () => {
  let service: ViewTracking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewTracking);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
