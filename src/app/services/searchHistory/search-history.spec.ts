import { TestBed } from '@angular/core/testing';

import { SearchHistory } from './search-history';

describe('SearchHistory', () => {
  let service: SearchHistory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchHistory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
