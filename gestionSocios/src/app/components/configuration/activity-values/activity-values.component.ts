import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DynamicFormComponent, FormField } from '../../commons/dynamic-form/dynamic-form.component';
import { ConfigurationService } from '../../../services/configurations.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-activity-values',
  imports: [DynamicFormComponent],
  templateUrl: './activity-values.component.html',
  styleUrl: './activity-values.component.scss'
})
export class ActivityValuesComponent {
  form!: FormGroup;
  activityValues: any[] = [];

  fields: FormField[] = [
    { 
      name: 'valor_1', 
      label: '1 Actividad', 
      type: 'number', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' },
      row: 1
    },
    { 
      name: 'valor_2', 
      label: '2 Actividades', 
      type: 'number', 
      validators: [Validators.required], 
      errorMessages: { required: 'Obligatorio' },
      row: 1
    },
    { 
      name: 'valor_3', 
      label: '3 Actividades', 
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

    this.configurationService.getActivityValues().subscribe({
      next: values => {
        this.activityValues = values;
        const formData: any = {};
        values.forEach((v: { cantidad_actividades: any; valor: any; }) => {
          formData[`valor_${v.cantidad_actividades}`] = v.valor;
        });
        this.form.patchValue(formData);
      },
      error: err => this.toast.show(err.error?.message, 'error')
    });
  }

  submit(formValue: any) {
    const updates = this.activityValues.map(activity => {
      const valor = formValue[`valor_${activity.cantidad_actividades}`];
      return this.configurationService.updateActivityValue(activity.id, valor);
    });

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