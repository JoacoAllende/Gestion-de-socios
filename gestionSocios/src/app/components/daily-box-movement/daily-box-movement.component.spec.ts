import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyBoxMovementComponent } from './daily-box-movement.component';

describe('DailyBoxMovementComponent', () => {
  let component: DailyBoxMovementComponent;
  let fixture: ComponentFixture<DailyBoxMovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyBoxMovementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyBoxMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
