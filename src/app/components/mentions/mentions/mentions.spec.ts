import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mentions } from './mentions';

describe('Mentions', () => {
  let component: Mentions;
  let fixture: ComponentFixture<Mentions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mentions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mentions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
