import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyBoxComponent } from './daily-box.component';

describe('DailyBoxComponent', () => {
  let component: DailyBoxComponent;
  let fixture: ComponentFixture<DailyBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
