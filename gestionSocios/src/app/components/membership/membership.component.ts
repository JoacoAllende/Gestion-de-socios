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
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'dni', label: 'DNI', type: 'number' },
    { name: 'cuota_activa', label: 'Cuota Activa', type: 'checkbox' },
    { name: 'cuota_pasiva', label: 'Cuota Pasiva', type: 'checkbox' },
    { name: 'beca', label: 'Becado', type: 'checkbox' },
    { name: 'futbol', label: 'Futbol', type: 'checkbox' },
    { name: 'paleta', label: 'Paleta', type: 'checkbox' },
    { name: 'basquet', label: 'Basquet', type: 'checkbox' },
  ];

  constructor(
    private fb: FormBuilder,
    private membershipService: MembershipService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '']);
    this.form = this.fb.group(controls);
    const idParam = this.route.snapshot.paramMap.get('id');
    this.socioId = idParam ? Number(idParam) : null;

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
