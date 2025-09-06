import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-field',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './date-field.component.html',
  styleUrl: './date-field.component.scss'
})
export class DateFieldComponent {
  @Input() field: any;
  @Input() form!: FormGroup;

  getErrorKeys(): string[] {
    const control = this.form.controls[this.field.name];
    return control && control.errors ? Object.keys(control.errors) : [];
  }
}
