import { TestBed } from '@angular/core/testing';

import { CategoryState } from './category-state';

describe('CategoryState', () => {
  let service: CategoryState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
