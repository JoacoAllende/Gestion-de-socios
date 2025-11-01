import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { EventsService } from '../../services/events.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-event',
  imports: [DynamicFormComponent],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent {
  form!: FormGroup;
  eventId: number | null = null;

  fields: FormField[] = [
    { 
      name: 'descripcion', 
      label: 'Descripción', 
      type: 'text', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' } 
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
      name: 'finalizado', 
      label: 'Finalizado', 
      type: 'select', 
      options: [
        { value: 0, label: 'No' }, 
        { value: 1, label: 'Sí' }
      ], 
      value: 0,
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
    const idParam = this.route.snapshot.paramMap.get('id');
    this.eventId = idParam ? Number(idParam) : null;

    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    if (this.eventId) {
      this.eventsService.getEventById(this.eventId).subscribe({
        next: event => {
          if (event.fecha) {
            const [day, month, year] = event.fecha.split('-');
            event.fecha = `${year}-${month}-${day}`;
          }
          this.form.patchValue(event);
        },
        error: err => this.toast.show(err.error?.message, 'error')
      });
    }
  }

  submit(formValue: any) {
    if (this.eventId) {
      this.eventsService.updateEvent(this.eventId, formValue).subscribe({
        next: (res) => {
          this.toast.show(res.status, 'success');
          this.router.navigate(['/eventos']);
        },
        error: err => this.toast.show(err.error?.sqlMessage, 'error')
      });
    } else {
      this.eventsService.createEvent(formValue).subscribe({
        next: (res) => {
          this.form.reset();
          this.router.navigate(['/eventos']);
          this.toast.show(res.status, 'success');
        },
        error: err => this.toast.show(err.error?.sqlMessage, 'error')
      });
    }
  }

  cancel() {
    this.router.navigate(['/eventos']);
  }
}