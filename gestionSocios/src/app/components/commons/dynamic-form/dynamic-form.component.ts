// dynamic-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { TextFieldComponent } from './text-field/text-field.component';
import { NumberFieldComponent } from './number-field/number-field.component';
import { CheckboxFieldComponent } from './checkbox-field/checkbox-field.component';
import { ButtonComponent } from '../button/button.component';
import { SelectFieldComponent, SelectOption } from './select-field/select-field.component';
import { Observable } from 'rxjs';
// import { FormField } from './form-field.model';

export type FieldType = 'text' | 'number' | 'checkbox' | 'select' | 'groupValidator';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  value?: any;
  options?: SelectOption[];
  options$?: Observable<SelectOption[]>;
  validators?: ValidatorFn[];
  errorMessages?: { [key: string]: string };
  groupValidators?: any[];
  row?: number;
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
    SelectFieldComponent,
    ButtonComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent {
  @Input() formTitle: string = '';
  @Input() fields: FormField[] = [];
  @Input() form!: FormGroup;

  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<any>();

  groupByRow(fields: FormField[]) {
    const groups: FormField[][] = [];

    fields.forEach(field => {
      if (field.row) {
        let group = groups.find(g => g.length && g[0].row === field.row);
        if (!group) {
          group = [];
          groups.push(group);
        }
        group.push(field);
      } else {
        groups.push([field]);
      }
    });
    return groups;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.value);
  }

  cancel() {
    this.cancelled.emit();
  }

  getErrorKeys(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    const errors: any = {};
    if (control?.errors) {
      Object.assign(errors, control.errors);
    }
    if (this.form.errors) {
      Object.assign(errors, this.form.errors);
    }
    return Object.keys(errors);
  }


}
