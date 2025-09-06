import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullStatisticsComponent } from './full-statistics.component';

describe('FullStatisticsComponent', () => {
  let component: FullStatisticsComponent;
  let fixture: ComponentFixture<FullStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullStatisticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
