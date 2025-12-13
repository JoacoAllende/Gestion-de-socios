import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicFormComponent, FormField } from '../../commons/dynamic-form/dynamic-form.component';
import { PaymentsService } from '../../../services/payments.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
  selector: 'app-recalculate-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './recalculate-payments.component.html'
})
export class RecalculatePaymentsComponent implements OnInit {
  form!: FormGroup;

  fields: FormField[] = [
    { 
      name: 'anio', 
      label: 'Año', 
      type: 'number', 
      validators: [Validators.required, Validators.min(2020), Validators.max(2100)], 
      errorMessages: { 
        required: 'Obligatorio',
        min: 'El año debe ser mayor a 2019',
        max: 'El año debe ser menor a 2101'
      },
    },
    { 
      name: 'mes_desde', 
      label: 'Recalcular desde mes', 
      type: 'select', 
      options: [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' }
      ],
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' },
    }
  ];

  constructor(
    private fb: FormBuilder,
    private paymentsService: PaymentsService,
    private router: Router,
    private toast: ToastService,
    private spinner: SpinnerService
  ) { }

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    const mesActual = new Date().getMonth() + 1;
    this.form.patchValue({ 
      anio: new Date().getFullYear(),
      mes_desde: mesActual
    });
  }

  submit(formValue: any) {
    const { anio, mes_desde } = formValue;
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    if (!confirm(`¿Recalcular todos los pagos NO PAGADOS desde ${mesesNombres[mes_desde - 1]} ${anio}?\n\nEsto actualizará los montos según las configuraciones actuales.`)) {
      return;
    }

    this.spinner.show();

    this.paymentsService.recalculatePayments(anio, mes_desde).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.form.reset();
        this.router.navigate(['/configuraciones']);
        this.toast.show(`${res.status}\nSocios actualizados: ${res.socios_actualizados}\nPagos actualizados: ${res.pagos_actualizados}`, 'success');
      },
      error: err => {
        this.spinner.hide();
        this.toast.show(err.error.error || err.error.message, 'error');
      }
    });
  }

  cancel() {
    this.router.navigate(['/configuraciones']);
  }
}