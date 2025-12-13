import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitializeYearComponent } from './initialize-year.component';

describe('InitializeYearComponent', () => {
  let component: InitializeYearComponent;
  let fixture: ComponentFixture<InitializeYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitializeYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitializeYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
