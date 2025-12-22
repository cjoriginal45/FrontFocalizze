import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMobile } from './search-mobile';

describe('SearchMobile', () => {
  let component: SearchMobile;
  let fixture: ComponentFixture<SearchMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchMobile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
