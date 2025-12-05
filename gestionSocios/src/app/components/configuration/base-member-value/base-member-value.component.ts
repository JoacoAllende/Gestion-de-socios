import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigurationService } from '../../../services/configurations.service';
import { ToastService } from '../../../services/toast.service';
import { DynamicFormComponent, FormField } from '../../commons/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-base-member-value',
  imports: [DynamicFormComponent],
  templateUrl: './base-member-value.component.html',
  styleUrl: './base-member-value.component.scss'
})
export class BaseMemberValueComponent {
  form!: FormGroup;

  fields: FormField[] = [
    { 
      name: 'valor', 
      label: 'Valor Socio Base', 
      type: 'number', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' }
    }
  ];

  constructor(
    private fb: FormBuilder,
    private configurationService: ConfigurationService,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = ['', f.validators ?? []]);
    this.form = this.fb.group(controls);

    this.configurationService.getBaseMemberValue().subscribe({
      next: data => {
        this.form.patchValue({ valor: data.valor });
      },
      error: err => this.toast.show(err.error?.message, 'error')
    });
  }

  submit(formValue: any) {
    this.configurationService.updateBaseMemberValue(formValue.valor).subscribe({
      next: (res) => {
        this.toast.show(res.status, 'success');
        this.router.navigate(['/configuraciones']);
      },
      error: err => this.toast.show(err.error?.message, 'error')
    });
  }

  cancel() {
    this.router.navigate(['/configuraciones']);
  }
}