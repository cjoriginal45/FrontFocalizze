import { TestBed } from '@angular/core/testing';

import { Save } from './save';

describe('Save', () => {
  let service: Save;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Save);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
