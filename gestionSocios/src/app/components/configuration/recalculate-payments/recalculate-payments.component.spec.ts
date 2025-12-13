import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecalculatePaymentsComponent } from './recalculate-payments.component';

describe('RecalculatePaymentsComponent', () => {
  let component: RecalculatePaymentsComponent;
  let fixture: ComponentFixture<RecalculatePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecalculatePaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecalculatePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
