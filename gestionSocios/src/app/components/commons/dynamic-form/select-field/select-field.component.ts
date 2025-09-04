import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { FormField } from '../dynamic-form.component';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss']
})
export class SelectFieldComponent {
  @Input() form!: FormGroup;
  @Input() name!: string;
  @Input() label!: string;
  @Input() field!: FormField;

  // Puede ser un array estático o un Observable
  @Input() options: SelectOption[] = [];
  @Input() options$?: Observable<SelectOption[]>;

  // Devuelve un observable que siempre funciona con async pipe
  get optionsObservable(): Observable<SelectOption[]> {
    return this.options$ ? this.options$ : of(this.options);
  }

  getErrorKeys(): string[] {
    const control = this.form.controls[this.field.name];
    return control && control.errors ? Object.keys(control.errors) : [];
  }
}
