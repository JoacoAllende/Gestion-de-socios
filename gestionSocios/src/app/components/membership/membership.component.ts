import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { MembershipService } from '../../services/membership.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './membership.component.html'
})
export class MembershipComponent implements OnInit {
  form!: FormGroup;
  socioId: number | null = null;
  isAlta: boolean = false;

  fields: FormField[] = [
    { name: 'nombre', label: 'Nombre completo', type: 'text', validators: [Validators.required], errorMessages: { required: 'Obligatorio' }, row: 5 },
    { name: 'dni', label: 'DNI', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' }, row: 5 },
    { name: 'direccion', label: 'Direccion', type: 'text', row: 8 },
    { name: 'contacto', label: 'Contacto', type: 'text', row: 8 },
    { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', row: 6 },
    { name: 'ficha_socio_id', label: 'Ficha', type: 'select', options: [], validators: [Validators.required], errorMessages: { required: 'Obligatorio' }, row: 6 },
    { name: 'cuota_activa', label: 'Cuota Activa', type: 'checkbox', row: 1 },
    { name: 'cuota_pasiva', label: 'Cuota Pasiva', type: 'checkbox', errorMessages: { cuotasExclusivas: 'Cuota activa y pasiva no pueden estar activas al mismo tiempo.' }, row: 1 },
    { name: 'descuento_familiar', label: 'Descuento familiar', type: 'checkbox', row: 7 },
    { name: 'becado', label: 'Becado', type: 'checkbox', errorMessages: { becadoValidator: 'Si es becado no puede tener cuota activa, cuota pasiva ni descuento familiar.' }, row: 7 },
    { name: 'futbol', label: 'Futbol', type: 'checkbox', row: 2 },
    { name: 'categoria_futbol_id', label: 'Categoría', type: 'select', options: [], row: 2, dependsOn: { field: 'futbol', value: true } },
    { name: 'paleta', label: 'Paleta', type: 'checkbox', row: 3 },
    { name: 'categoria_paleta_id', label: 'Categoría', type: 'select', options: [], row: 3, dependsOn: { field: 'paleta', value: true } },
    { name: 'basquet', label: 'Basquet', type: 'checkbox', row: 4 },
    { name: 'categoria_basquet_id', label: 'Categoría', type: 'select', options: [], row: 4, dependsOn: { field: 'basquet', value: true } },
    { name: 'mes_alta', label: 'Mes alta', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
  ];

  constructor(
    private fb: FormBuilder,
    private membershipService: MembershipService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.socioId = idParam ? Number(idParam) : null;
    this.isAlta = this.router.url.startsWith('/socio-alta');
    if (!this.isAlta && this.socioId) {
      this.fields.push({ name: 'baja', label: 'Dar de baja', type: 'checkbox' });
    }

    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    ['cuota_activa', 'cuota_pasiva'].forEach(name => {
      this.form.get(name)?.valueChanges.subscribe(() => this.cuotasExclusivasValidator(this.form));
    });
    ['becado', 'cuota_activa', 'cuota_pasiva', 'descuento_familiar'].forEach(name => {
      this.form.get(name)?.valueChanges.subscribe(() => this.becadoValidator(this.form));
    });

    this.membershipService.getFutbolCategories().subscribe({
      next: categories => {
        const idx = this.fields.findIndex(f => f.name === 'categoria_futbol_id');
        if (idx > -1) {
          this.fields[idx] = {
            ...this.fields[idx],
            options: [
              { label: '', value: '' },
              ...categories.map((c: any) => ({ label: c.nombre, value: c.id }))
            ]
          };
        }
      },
      error: err => this.toast.show(err.error.message, 'error')
    });

    this.membershipService.getBasquetCategories().subscribe({
      next: categories => {
        const idx = this.fields.findIndex(f => f.name === 'categoria_basquet_id');
        if (idx > -1) {
          this.fields[idx] = {
            ...this.fields[idx],
            options: [
              { label: '', value: '' },
              ...categories.map((c: any) => ({ label: c.nombre, value: c.id }))
            ]
          };
        }
      },
      error: err => this.toast.show(err.error.message, 'error')
    });

    this.membershipService.getPaletaCategories().subscribe({
      next: categories => {
        const idx = this.fields.findIndex(f => f.name === 'categoria_paleta_id');
        if (idx > -1) {
          this.fields[idx] = {
            ...this.fields[idx],
            options: [
              { label: '', value: '' },
              ...categories.map((c: any) => ({ label: c.nombre, value: c.id }))
            ]
          };
        }
      },
      error: err => this.toast.show(err.error.message, 'error')
    });

    this.membershipService.getMembershipCard().subscribe({
      next: card => {
        const idx = this.fields.findIndex(f => f.name === 'ficha_socio_id');
        if (idx > -1) {
          this.fields[idx] = {
            ...this.fields[idx],
            options: [
              { label: '', value: '' },
              ...card.map((f: any) => ({ label: f.nombre, value: f.id }))
            ]
          };
        }
      },
      error: err => this.toast.show(err.error.message, 'error')
    });

    if (this.socioId) {
      this.membershipService.getMembership(this.socioId).subscribe({
        next: socio => this.form.patchValue(socio),
        error: err => this.toast.show(err.error.message, 'error')
      });
    }
  }

  cuotasExclusivasValidator(form: FormGroup): ValidationErrors | null {
    const cuotaActiva = form.get('cuota_activa')?.value;
    const cuotaPasiva = form.get('cuota_pasiva')?.value;

    if (cuotaActiva && cuotaPasiva) {
      form.get('cuota_pasiva')?.setErrors({ cuotasExclusivas: true });
    } else {
      const control = form.get('cuota_pasiva');
      if (control?.hasError('cuotasExclusivas')) {
        const errors = { ...control.errors };
        delete errors['cuotasExclusivas'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  becadoValidator(form: FormGroup): ValidationErrors | null {
    const becado = form.get('becado')?.value;
    const cuotaActiva = form.get('cuota_activa')?.value;
    const cuotaPasiva = form.get('cuota_pasiva')?.value;
    const descuentoFamiliar = form.get('descuento_familiar')?.value;

    const control = form.get('becado');
    if (becado && (cuotaActiva || cuotaPasiva || descuentoFamiliar)) {
      control?.setErrors({ becadoValidator: true });
    } else {
      if (control?.hasError('becadoValidator')) {
        const errors = { ...control.errors };
        delete errors['becadoValidator'];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
    return null;
  }

  submit(formValue: any) {
    if (this.socioId) {
      if (this.isAlta) {
        formValue = { ...formValue, alta: true };
      }
      this.membershipService.updateMembership(this.socioId, formValue).subscribe({
        next: (res) => {
          this.form.reset();
          this.router.navigate(['/pagos']);
          this.toast.show(res.status, 'success');
        },
        error: err => this.toast.show(err.error.sqlMessage, 'error')
      });
    } else {
      this.membershipService.createMembership(formValue).subscribe({
        next: (res) => {
          this.form.reset();
          this.router.navigate(['/pagos']);
          this.toast.show(res.status, 'success');
        },
        error: err => this.toast.show(err.error.sqlMessage, 'error')
      });
    }
  }

  cancel() {
    this.router.navigate(['/pagos']);
  }
}
