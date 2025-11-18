import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-movement-detail',
  imports: [DynamicFormComponent],
  templateUrl: './movement-detail.component.html',
  styleUrl: './movement-detail.component.scss'
})
export class MovementDetailComponent {
  form!: FormGroup;
  movementId!: number;
  detailId: number | null = null;

  fields: FormField[] = [
    {
      name: 'concepto',
      label: 'Concepto',
      row: 3,
      type: 'text',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' }
    },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'INGRESO', label: 'Ingreso' },
        { value: 'EGRESO', label: 'Egreso' }
      ],
      value: 'EGRESO',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' },
      row: 1
    },
    {
      name: 'medio_pago',
      label: 'Medio de Pago',
      type: 'select',
      options: [
        { value: 'EFECTIVO', label: 'Efectivo' },
        { value: 'TRANSFERENCIA', label: 'Transferencia' },
        { value: 'CHEQUE', label: 'Cheque' }
      ],
      value: 'EFECTIVO',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' },
      row: 1
    },
    {
      name: 'monto',
      label: 'Monto',
      type: 'number',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' },
      row: 3
    },
    {
      name: 'pagado',
      label: 'Pagado',
      type: 'select',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Sí' }
      ],
      value: 0,
      row: 2,
      dependsOn: { field: 'tipo', value: 'EGRESO' }
    },
    {
      name: 'fecha_pago',
      label: 'Fecha de Pago',
      type: 'date',
      row: 2,
      dependsOn: { field: 'tipo', value: 'EGRESO' }
    },
    {
      name: 'observaciones',
      label: 'Observaciones',
      type: 'text'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    this.movementId = Number(this.route.snapshot.paramMap.get('movementId'));
    const detailIdParam = this.route.snapshot.paramMap.get('detailId');
    this.detailId = detailIdParam ? Number(detailIdParam) : null;

    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    if (this.detailId) {
      // Cargar detalle para editar
      this.eventsService.getDetailsByMovement(this.movementId).subscribe({
        next: details => {
          const detail = details.find(d => d.id === this.detailId);
          if (detail) {
            // Convertir fechas
            if (detail.fecha) {
              const [day, month, year] = detail.fecha.split('-');
              detail.fecha = `${year}-${month}-${day}`;
            }
            if (detail.fecha_pago) {
              const [day, month, year] = detail.fecha_pago.split('-');
              detail.fecha_pago = `${year}-${month}-${day}`;
            }
            this.form.patchValue(detail);
          }
        },
        error: err => this.toast.show(err.error?.message, 'error')
      });
    }
  }

  submit(formValue: any) {
    // Limpiar campos que no deberían enviarse según dependsOn
    const dataToSend = { ...formValue };

    // Si es INGRESO, remover pagado y fecha_pago (no se muestran)
    if (formValue.tipo === 'INGRESO') {
      delete dataToSend.pagado;
      delete dataToSend.fecha_pago;
    }

    if (this.detailId) {
      this.eventsService.updateDetail(this.detailId, dataToSend).subscribe({
        next: (res) => {
          this.toast.show(res.status, 'success');
          this.router.navigate([`/movimiento/${this.movementId}/detalles`]);
        },
        error: err => this.toast.show(err.error?.sqlMessage, 'error')
      });
    } else {
      this.eventsService.createDetail(this.movementId, dataToSend).subscribe({
        next: (res) => {
          this.toast.show(res.status, 'success');
          this.router.navigate([`/movimiento/${this.movementId}/detalles`]);
        },
        error: err => this.toast.show(err.error?.sqlMessage, 'error')
      });
    }
  }

  cancel() {
    this.router.navigate([`/movimiento/${this.movementId}/detalles`]);
  }
}