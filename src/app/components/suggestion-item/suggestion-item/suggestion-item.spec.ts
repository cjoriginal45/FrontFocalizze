import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionItem } from './suggestion-item';

describe('SuggestionItem', () => {
  let component: SuggestionItem;
  let fixture: ComponentFixture<SuggestionItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
