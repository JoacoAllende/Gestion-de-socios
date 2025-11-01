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

  fields: FormField[] = [
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

    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    if (this.movementId) {
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
    }
  }

  submit(formValue: any) {
    if (this.movementId) {
      this.eventsService.updateMovement(this.movementId, formValue).subscribe({
        next: (res) => {
          this.toast.show(res.status, 'success');
          this.router.navigate([`/evento/${this.eventId}/movimientos`]);
        },
        error: err => this.toast.show(err.error?.sqlMessage, 'error')
      });
    } else {
      this.eventsService.createMovement(this.eventId, formValue).subscribe({
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