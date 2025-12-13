import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitializeYearEmployeesComponent } from './initialize-year-employees.component';

describe('InitializeYearEmployeesComponent', () => {
  let component: InitializeYearEmployeesComponent;
  let fixture: ComponentFixture<InitializeYearEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitializeYearEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitializeYearEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
