import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottonNav } from './botton-nav';

describe('BottonNav', () => {
  let component: BottonNav;
  let fixture: ComponentFixture<BottonNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottonNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottonNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
