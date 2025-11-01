import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMovementComponent } from './event-movement.component';

describe('EventMovementComponent', () => {
  let component: EventMovementComponent;
  let fixture: ComponentFixture<EventMovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMovementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
