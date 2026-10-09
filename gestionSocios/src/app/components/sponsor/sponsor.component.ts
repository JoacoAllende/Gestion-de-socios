import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { SponsorsService, SponsorType } from '../../services/sponsors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-sponsor',
  imports: [DynamicFormComponent],
  templateUrl: './sponsor.component.html',
  styleUrl: './sponsor.component.scss'
})
export class SponsorComponent {
  form!: FormGroup;
  sponsorId: number | null = null;
  anio: number = new Date().getFullYear();
  tipo: SponsorType = 'camisetas';
  isAlta: boolean = false;

  fields: FormField[] = [
    { name: 'nombre', label: 'Empresa', type: 'text', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'monto', label: 'Monto', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'detalles', label: 'Observaciones', type: 'text' },
    { name: 'mes_alta', label: 'Mes alta', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
  ];

  constructor(
    private fb: FormBuilder,
    private sponsorsService: SponsorsService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) { }

  get formTitle(): string {
    return `Publicidad - ${this.tipo === 'colectivo' ? 'Colectivo' : 'Camisetas'}`;
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.sponsorId = idParam ? Number(idParam) : null;
    const anioParam = this.route.snapshot.paramMap.get('anio');
    this.anio = anioParam ? Number(anioParam) : new Date().getFullYear();
    this.tipo = this.route.snapshot.paramMap.get('tipo') === 'colectivo' ? 'colectivo' : 'camisetas';
    this.isAlta = this.router.url.startsWith('/publicidad-alta');
    if (!this.isAlta && this.sponsorId) {
      this.fields.push({ name: 'baja', label: 'Dar de baja', type: 'checkbox' });
    }

    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    if (this.sponsorId) {
      this.sponsorsService.getSponsorById(this.sponsorId).subscribe({
        next: sponsor => this.form.patchValue(sponsor),
        error: err => this.toast.show(err.error.error || err.error.message, 'error')
      });
    }
  }

  submit(formValue: any) {
    const request = this.sponsorId
      ? this.sponsorsService.updateSponsor(this.sponsorId, this.anio, this.isAlta ? { ...formValue, alta: true } : formValue)
      : this.sponsorsService.createSponsor(this.tipo, this.anio, formValue);

    request.subscribe({
      next: (res) => {
        this.form.reset();
        this.router.navigate(['/publicidades', this.tipo, this.anio]);
        this.toast.show(res.status, 'success');
      },
      error: err => this.toast.show(err.error.sqlMessage || err.error.error, 'error')
    });
  }

  cancel() {
    this.router.navigate(['/publicidades', this.tipo, this.anio]);
  }
}
