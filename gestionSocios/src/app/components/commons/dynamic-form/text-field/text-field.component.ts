import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '../dynamic-form.component';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss']
})
export class TextFieldComponent {
  @Input() field!: FormField;
  @Input() form!: FormGroup;

  getErrorKeys(): string[] {
    const control = this.form.controls[this.field.name];
    return control && control.errors ? Object.keys(control.errors) : [];
  }
}


