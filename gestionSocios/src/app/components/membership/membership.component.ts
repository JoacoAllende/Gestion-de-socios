import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
    { name: 'nombre', label: 'Nombre completo', type: 'text' },
    { name: 'dni', label: 'DNI', type: 'number' },
    {
      name: 'genero',
      label: 'Género',
      type: 'select',
      options: [
        { label: 'Femenino', value: 'F' },
        { label: 'Masculino', value: 'M' }
      ]
    },
    {
      name: 'categoria_id',
      label: 'Categoría',
      type: 'select',
      options: []
    },
    { name: 'cuota_activa', label: 'Cuota Activa', type: 'checkbox' },
    { name: 'cuota_pasiva', label: 'Cuota Pasiva', type: 'checkbox' },
    { name: 'descuento_familiar', label: 'Descuento familiar', type: 'checkbox' },
    { name: 'becado', label: 'Becado', type: 'checkbox' },
    { name: 'secretaria', label: 'Ficha en secretaria', type: 'checkbox' },
    { name: 'futbol', label: 'Futbol', type: 'checkbox' },
    { name: 'paleta', label: 'Paleta', type: 'checkbox' },
    { name: 'basquet', label: 'Basquet', type: 'checkbox' },
    { name: 'mes_alta', label: 'Mes alta', type: 'number' },
  ];

  constructor(
    private fb: FormBuilder,
    private membershipService: MembershipService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '']);
    this.form = this.fb.group(controls);
    const idParam = this.route.snapshot.paramMap.get('id');
    this.socioId = idParam ? Number(idParam) : null;
    this.membershipService.getCategories().subscribe({
      next: categories => {
        const idx = this.fields.findIndex(f => f.name === 'categoria_id');
        if (idx > -1) {
          this.fields[idx] = {
            ...this.fields[idx],
            options: [
              { label: '', value: '' },
              ...categories.map((c: any) => ({
                label: c.nombre,
                value: c.id
              }))
            ]
          };
        }
      },

      error: err => console.error('Error al cargar categorías', err)
    });

    if (this.socioId) {
      this.membershipService.getMembership(this.socioId).subscribe({
        next: socio => this.form.patchValue(socio),
        error: err => console.error('Error al cargar socio', err)
      });
    }
  }

  submit(formValue: any) {
    if (this.socioId) {
      this.membershipService.updateMembership(this.socioId, formValue).subscribe({
        next: () => {
          this.router.navigate(['']);
        },
        error: (err) => {
          console.error('Error al actualizar socio', err);
        },
      });
    } else {
      this.membershipService.createMembership(formValue).subscribe({
        next: () => {
          this.form.reset();
          this.router.navigate(['']);
        },
        error: (err) => {
          console.error('Error al crear socio', err);
        },
      });
    }
  }
}
