import { TestBed } from '@angular/core/testing';

import { DiscoverFeed } from './discover-feed';

describe('DiscoverFeed', () => {
  let service: DiscoverFeed;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscoverFeed);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
