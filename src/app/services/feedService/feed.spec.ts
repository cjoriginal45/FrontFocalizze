import { TestBed } from '@angular/core/testing';
import { Feed } from '../../pages/feed/feed';


describe('Feed', () => {
  let service: Feed;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Feed);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
