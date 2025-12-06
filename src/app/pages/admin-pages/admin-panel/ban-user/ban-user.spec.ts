import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanUser } from './ban-user';

describe('BanUser', () => {
  let component: BanUser;
  let fixture: ComponentFixture<BanUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
