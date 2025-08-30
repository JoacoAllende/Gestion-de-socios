// fields/checkbox-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../dynamic-form.component';
@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkbox-field.component.html',
  styleUrls: ['./checkbox-field.component.scss']
})
export class CheckboxFieldComponent {
  @Input() field!: FormField;
  @Input() form!: FormGroup;

  getErrorKeys(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    return control?.errors ? Object.keys(control.errors) : [];
  }

}
