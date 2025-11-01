import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMovementsComponent } from './event-movements.component';

describe('EventMovementsComponent', () => {
  let component: EventMovementsComponent;
  let fixture: ComponentFixture<EventMovementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMovementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventMovementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
