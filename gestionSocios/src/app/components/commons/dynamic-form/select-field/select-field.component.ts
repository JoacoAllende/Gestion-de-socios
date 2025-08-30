import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

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
export class SelectFieldComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() name!: string;
  @Input() label!: string;

  @Input() options: SelectOption[] = [];
  @Input() options$?: Observable<SelectOption[]>;

  optionsList: SelectOption[] = [];

  ngOnInit() {
    if (this.options$) {
      this.options$.subscribe(data => this.optionsList = data);
    } else {
      this.optionsList = this.options;
    }
  }
}
