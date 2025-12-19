import { TestBed } from '@angular/core/testing';
import { Profile } from '../../pages/profile/profile/profile';



describe('Profile', () => {
  let service: Profile;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Profile);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
