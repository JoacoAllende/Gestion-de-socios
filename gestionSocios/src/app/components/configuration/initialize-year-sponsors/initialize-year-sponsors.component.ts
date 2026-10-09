import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicFormComponent, FormField } from '../../commons/dynamic-form/dynamic-form.component';
import { SponsorsService } from '../../../services/sponsors.service';
import { ToastService } from '../../../services/toast.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
  selector: 'app-initialize-year-sponsors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './initialize-year-sponsors.component.html'
})
export class InitializeYearSponsorsComponent implements OnInit {
  form!: FormGroup;

  fields: FormField[] = [
    { 
      name: 'anio', 
      label: 'Año a inicializar', 
      type: 'number', 
      validators: [Validators.required, Validators.min(2020), Validators.max(2100)], 
      errorMessages: { 
        required: 'Obligatorio',
        min: 'El año debe ser mayor a 2019',
        max: 'El año debe ser menor a 2101'
      }
    }
  ];

  constructor(
    private fb: FormBuilder,
    private sponsorsService: SponsorsService,
    private router: Router,
    private toast: ToastService,
    private spinner: SpinnerService
  ) { }

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    this.form.patchValue({ anio: new Date().getFullYear() + 1 });
  }

  submit(formValue: any) {
    const { anio } = formValue;

    if (!confirm(`¿Estás seguro de inicializar el año ${anio} para publicidades?\n\nEsto creará 12 meses de publicidad para TODAS las publicidades activas (camisetas y colectivo).\n\nSolo se puede hacer UNA VEZ por año.`)) {
      return;
    }

    this.spinner.show();

    this.sponsorsService.initializeYear(anio).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.form.reset();
        this.router.navigate(['/configuraciones']);
        this.toast.show(`${res.status}\nPublicidades procesadas: ${res.anunciantes_procesados}\nMeses creados: ${res.publicidades_creadas}`, 'success');
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