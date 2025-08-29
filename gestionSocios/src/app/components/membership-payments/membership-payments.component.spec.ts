import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipPaymentsComponent } from './membership-payments.component';

describe('MembershipPaymentsComponent', () => {
  let component: MembershipPaymentsComponent;
  let fixture: ComponentFixture<MembershipPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipPaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
