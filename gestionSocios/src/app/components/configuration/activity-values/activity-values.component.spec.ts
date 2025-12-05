import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityValuesComponent } from './activity-values.component';

describe('ActivityValuesComponent', () => {
  let component: ActivityValuesComponent;
  let fixture: ComponentFixture<ActivityValuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityValuesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
