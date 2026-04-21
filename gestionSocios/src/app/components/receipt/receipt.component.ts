import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { PdfService } from '../../services/pdf.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [DynamicFormComponent],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss'
})
export class ReceiptComponent implements OnInit {
  form!: FormGroup;

  fields: FormField[] = [
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'ingreso', label: 'Ingreso' },
        { value: 'egreso', label: 'Egreso' }
      ],
      value: 'egreso',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' }
    },
    {
      name: 'responsable',
      label: 'Recibido por',
      type: 'select',
      options: [
        { value: 'Lucia Farina', label: 'Lucia Farina' },
        { value: 'Ezequiel Carlon', label: 'Ezequiel Carlon' }
      ],
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' },
      dependsOn: { field: 'tipo', value: 'ingreso' }
    },
    {
      name: 'persona',
      label: 'A nombre de',
      type: 'text',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' }
    },
    {
      name: 'descripcion',
      label: 'Descripción / Concepto',
      type: 'text',
      validators: [Validators.required],
      errorMessages: { required: 'Obligatorio' }
    },
    {
      name: 'monto',
      label: 'Valor',
      type: 'number',
      validators: [Validators.required, Validators.min(0.01)],
      errorMessages: {
        required: 'Obligatorio',
        min: 'El valor debe ser mayor a 0'
      }
    },
  ];

  constructor(
    private fb: FormBuilder,
    private pdfService: PdfService,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);
  }

  submit(formValue: any) {
    console.log('submit recibido:', formValue);
    try {
      this.pdfService.generarRecibo({
        tipo: formValue.tipo,
        persona: formValue.persona,
        descripcion: formValue.descripcion,
        monto: formValue.monto,
        responsable: formValue.responsable
      });

      this.toast.show('Recibo generado exitosamente', 'success');
      this.form.reset({ tipo: 'egreso' });
    } catch (error) {
      this.toast.show('Error al generar el recibo', 'error');
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
