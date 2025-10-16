import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingDiscovering } from './following-discovering';

describe('FollowingDiscovering', () => {
  let component: FollowingDiscovering;
  let fixture: ComponentFixture<FollowingDiscovering>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowingDiscovering]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowingDiscovering);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
