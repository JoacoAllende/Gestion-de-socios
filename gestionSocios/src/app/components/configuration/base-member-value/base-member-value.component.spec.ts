import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseMemberValueComponent } from './base-member-value.component';

describe('BaseMemberValueComponent', () => {
  let component: BaseMemberValueComponent;
  let fixture: ComponentFixture<BaseMemberValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseMemberValueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseMemberValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
