import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipStateComponent } from './membership-state.component';

describe('MembershipStateComponent', () => {
  let component: MembershipStateComponent;
  let fixture: ComponentFixture<MembershipStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembershipStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
