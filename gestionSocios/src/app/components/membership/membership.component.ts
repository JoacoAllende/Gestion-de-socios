import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { MembershipService } from '../../services/membership.service';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './membership.component.html'
})
export class MembershipComponent implements OnInit {
  form!: FormGroup;
  socioId: number | null = null;

  fields: FormField[] = [
    { name: 'nombre', label: 'Nombre completo', type: 'text', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'dni', label: 'DNI', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'direccion', label: 'Direccion', type: 'text' },
    { name: 'ficha_socio_id', label: 'Ficha', type: 'select', options: [] },
    { name: 'cuota_activa', label: 'Cuota Activa', type: 'checkbox' },
    { name: 'cuota_pasiva', label: 'Cuota Pasiva', type: 'checkbox', errorMessages: { cuotasExclusivas: 'Cuota activa y pasiva no pueden estar activas al mismo tiempo.' } },
    { name: 'descuento_familiar', label: 'Descuento familiar', type: 'checkbox' },
    { name: 'becado', label: 'Becado', type: 'checkbox', errorMessages: { becadoValidator: 'Si es becado no puede tener cuota activa, cuota pasiva ni descuento familiar.' } },
    { name: 'secretaria', label: 'Ficha en secretaria', type: 'checkbox' },
    { name: 'futbol', label: 'Futbol', type: 'checkbox' },
    { name: 'categoria_futbol_id', label: 'Categoría', type: 'select', options: [] },
    { name: 'paleta', label: 'Paleta', type: 'checkbox' },
    { name: 'categoria_paleta_id', label: 'Categoría', type: 'select', options: [] },
    { name: 'basquet', label: 'Basquet', type: 'checkbox' },
    { name: 'categoria_basquet_id', label: 'Categoría', type: 'select', options: [] },
    { name: 'mes_alta', label: 'Mes alta', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
  ];

  constructor(
    private fb: FormBuilder,
    private membershipService: MembershipService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);

    this.form = this.fb.group(controls);

    ['cuota_activa', 'cuota_pasiva'].forEach(name => {
      this.form.get(name)?.valueChanges.subscribe(() => this.cuotasExclusivasValidator(this.form));
    });
    ['becado', 'cuota_activa', 'cuota_pasiva', 'descuento_familiar'].forEach(name => {
      this.form.get(name)?.valueChanges.subscribe(() => this.becadoValidator(this.form));
    });


    const idParam = this.route.snapshot.paramMap.get('id');
    this.socioId = idParam ? Number(idParam) : null;

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
      error: err => console.error('Error al cargar categorías de Futbol', err)
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
      error: err => console.error('Error al cargar categorías de Basquet', err)
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
      error: err => console.error('Error al cargar categorías de Paleta', err)
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
      error: err => console.error('Error al cargar fichas de socio', err)
    });

    if (this.socioId) {
      this.membershipService.getMembership(this.socioId).subscribe({
        next: socio => this.form.patchValue(socio),
        error: err => console.error('Error al cargar socio', err)
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
      this.membershipService.updateMembership(this.socioId, formValue).subscribe({
        next: () => this.router.navigate(['/socios']),
        error: err => console.error('Error al actualizar socio', err)
      });
    } else {
      this.membershipService.createMembership(formValue).subscribe({
        next: () => { this.form.reset(); this.router.navigate(['/socios']); },
        error: err => console.error('Error al crear socio', err)
      });
    }
  }

  cancel() {
    this.router.navigate(['/socios']);
  }
}
