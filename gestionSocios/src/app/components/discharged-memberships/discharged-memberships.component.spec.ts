import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DischargedMembershipsComponent } from './discharged-memberships.component';

describe('DischargedMembershipsComponent', () => {
  let component: DischargedMembershipsComponent;
  let fixture: ComponentFixture<DischargedMembershipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargedMembershipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DischargedMembershipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
