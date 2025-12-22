import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedThreads } from './saved-threads';

describe('SavedThreads', () => {
  let component: SavedThreads;
  let fixture: ComponentFixture<SavedThreads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedThreads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedThreads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
