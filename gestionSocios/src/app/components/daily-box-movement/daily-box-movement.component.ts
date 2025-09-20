import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { DailyBoxService } from '../../services/daily-box.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-daily-box-movement',
  imports: [DynamicFormComponent],
  templateUrl: './daily-box-movement.component.html',
  styleUrl: './daily-box-movement.component.scss'
})
export class DailyBoxMovementComponent {
  form!: FormGroup;
  movementId: number | null = null;

  fields: FormField[] = [
    { name: 'concepto', label: 'Concepto', type: 'text', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'monto', label: 'Monto', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'INGRESO', label: 'Ingreso' }, { value: 'EGRESO', label: 'Egreso' }], value: 'INGRESO', row: 1, },
    { name: 'medio_pago', label: 'Medio', type: 'select', options: [{ value: 'EFECTIVO', label: 'Efectivo' }, { value: 'TRANSFERENCIA', label: 'Transferencia' }], value: 'EFECTIVO', row: 1 },
  ];

  constructor(
    private fb: FormBuilder,
    private dailyBoxService: DailyBoxService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.movementId = idParam ? Number(idParam) : null;

    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    if (this.movementId) {
      this.dailyBoxService.getMovementById(this.movementId).subscribe({
        next: movement => this.form.patchValue(movement),
        error: err => this.toast.show(err.error?.message, 'error')
      });
    }
  }

  submit(formValue: any) {
    if (this.movementId) {
      this.dailyBoxService.updateMovement(this.movementId, formValue).subscribe({
      next: (res) => {
        this.toast.show(res.status, 'success');
        this.router.navigate(['/caja']);
      },
      error: err => this.toast.show(err.error?.sqlMessage, 'error')
    });
    } else {
      this.dailyBoxService.createMovement(formValue).subscribe({
        next: (res) => {
          this.form.reset();
          this.router.navigate(['/caja']);
          this.toast.show(res.status, 'success');
        },
        error: err => this.toast.show(err.error.sqlMessage, 'error')
      });
    }
  }

  cancel() {
    this.router.navigate(['/caja']);
  }
}
