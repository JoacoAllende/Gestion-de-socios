import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-event-movement',
  imports: [DynamicFormComponent],
  templateUrl: './event-movement.component.html',
  styleUrl: './event-movement.component.scss'
})
export class EventMovementComponent {
  form!: FormGroup;
  eventId!: number;
  movementId: number | null = null;

  fields: FormField[] = [];
  baseFields: FormField[] = [
    { 
      name: 'concepto', 
      label: 'Concepto', 
      type: 'text', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' } 
    },
    { 
      name: 'monto', 
      label: 'Monto', 
      type: 'number', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' },
      row: 1
    },
    { 
      name: 'fecha', 
      label: 'Fecha', 
      type: 'date', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' },
      row: 1
    },
    { 
      name: 'observaciones', 
      label: 'Observaciones', 
      type: 'text'
    }
  ];

  creationOnlyFields: FormField[] = [
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select', 
      options: [
        { value: 'EGRESO', label: 'Egreso' },
        { value: 'INGRESO', label: 'Ingreso' }
      ], 
      value: 'EGRESO',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' },
      row: 2
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
      row: 2
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
      row: 3,
      dependsOn: { field: 'tipo', value: 'EGRESO' }
    },
    { 
      name: 'fecha_pago', 
      label: 'Fecha de Pago', 
      type: 'date',
      row: 3,
      dependsOn: { field: 'tipo', value: 'EGRESO' }
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
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    const movementIdParam = this.route.snapshot.paramMap.get('movementId');
    this.movementId = movementIdParam ? Number(movementIdParam) : null;

    if (this.movementId) {
      this.fields = [...this.baseFields];

      const controls: any = {};
      this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
      this.form = this.fb.group(controls);

      this.eventsService.getMovementsByEvent(this.eventId).subscribe({
        next: movements => {
          const movement = movements.find(m => m.id === this.movementId);
          if (movement) {
            if (movement.fecha) {
              const [day, month, year] = movement.fecha.split('-');
              movement.fecha = `${year}-${month}-${day}`;
            }
            this.form.patchValue(movement);
          }
        },
        error: err => this.toast.show(err.error?.message, 'error')
      });
    } else {
      this.fields = [...this.baseFields, ...this.creationOnlyFields];

      const controls: any = {};
      this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
      this.form = this.fb.group(controls);
    }
  }

  submit(formValue: any) {
    if (this.movementId) {
      const movementData = {
        concepto: formValue.concepto,
        monto: formValue.monto,
        fecha: formValue.fecha,
        observaciones: formValue.observaciones
      };

      this.eventsService.updateMovement(this.movementId, movementData).subscribe({
        next: (res) => {
          this.toast.show(res.status, 'success');
          this.router.navigate([`/evento/${this.eventId}/movimientos`]);
        },
        error: err => this.toast.show(err.error?.sqlMessage, 'error')
      });
    } else {
      const movementData = {
        concepto: formValue.concepto,
        monto: formValue.monto,
        fecha: formValue.fecha,
        observaciones: formValue.observaciones,
        detalle: {
          tipo: formValue.tipo,
          concepto: formValue.concepto,
          monto: formValue.monto,
          medio_pago: formValue.medio_pago,
          pagado: formValue.pagado,
          fecha_pago: formValue.fecha_pago,
          observaciones: formValue.observaciones
        }
      };

      this.eventsService.createMovement(this.eventId, movementData).subscribe({
        next: (res) => {
          this.toast.show(res.status, 'success');
          this.router.navigate([`/evento/${this.eventId}/movimientos`]);
        },
        error: err => this.toast.show(err.error?.sqlMessage, 'error')
      });
    }
  }

  cancel() {
    this.router.navigate([`/evento/${this.eventId}/movimientos`]);
  }
}