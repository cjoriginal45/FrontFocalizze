import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAccounts } from './manage-accounts';

describe('ManageAccounts', () => {
  let component: ManageAccounts;
  let fixture: ComponentFixture<ManageAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageAccounts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAccounts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
