import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DynamicFormComponent, FormField } from '../../commons/dynamic-form/dynamic-form.component';
import { ConfigurationService } from '../../../services/configurations.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-discounts',
  imports: [DynamicFormComponent],
  templateUrl: './discounts.component.html',
  styleUrl: './discounts.component.scss'
})
export class DiscountsComponent {
  form!: FormGroup;
  discounts: any[] = [];

  fields: FormField[] = [
    { 
      name: 'descuento_familiar', 
      label: 'Descuento Familiar', 
      type: 'number', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' },
      row: 1
    },
    { 
      name: 'cuota_pasiva', 
      label: 'Cuota Pasiva', 
      type: 'number', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' },
      row: 1
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

    this.configurationService.getDiscounts().subscribe({
      next: discounts => {
        this.discounts = discounts;
        const formData: any = {};
        discounts.forEach((d: { tipo: string; valor: any; }) => {
          const key = d.tipo === 'FAMILIAR' ? 'descuento_familiar' : 'cuota_pasiva';
          formData[key] = d.valor;
        });
        this.form.patchValue(formData);
      },
      error: err => this.toast.show(err.error?.message, 'error')
    });
  }

  submit(formValue: any) {
    const updates = [
      this.configurationService.updateDiscount('FAMILIAR', formValue.descuento_familiar),
      this.configurationService.updateDiscount('PASIVA', formValue.cuota_pasiva)
    ];

    forkJoin(updates).subscribe({
      next: (responses) => {
        this.toast.show(responses[0].status, 'success');
        this.router.navigate(['/configuraciones']);
      },
      error: err => this.toast.show(err.error?.message, 'error')
    });
  }

  cancel() {
    this.router.navigate(['/configuraciones']);
  }
}