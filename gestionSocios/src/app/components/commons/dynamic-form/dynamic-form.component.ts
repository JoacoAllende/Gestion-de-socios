// dynamic-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextFieldComponent } from './text-field/text-field.component';
import { NumberFieldComponent } from './number-field/number-field.component';
import { CheckboxFieldComponent } from './checkbox-field/checkbox-field.component';
import { ButtonComponent } from '../button/button.component';
// import { FormField } from './form-field.model';

export type FieldType = 'text' | 'number' | 'checkbox';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  value?: any;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFieldComponent,
    NumberFieldComponent,
    CheckboxFieldComponent,
    ButtonComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent {
  @Input() fields: FormField[] = [];
  @Input() form!: FormGroup;

  @Output() submitted = new EventEmitter<any>();

  submit() {
    this.submitted.emit(this.form.value);
  }
}
