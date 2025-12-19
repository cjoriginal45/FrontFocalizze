import { TestBed } from '@angular/core/testing';
import { SavedThreads } from '../../pages/saved-threads/saved-threads/saved-threads';


describe('SavedThreads', () => {
  let service: SavedThreads;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedThreads);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
