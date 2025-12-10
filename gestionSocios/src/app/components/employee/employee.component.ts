import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { EmployeesService } from '../../services/employees.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-employee',
  imports: [DynamicFormComponent],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent {
  form!: FormGroup;
  employeeId: number | null = null;
  anio: number = new Date().getFullYear();
  isAlta: boolean = false;

  fields: FormField[] = [
    { name: 'nombre', label: 'Nombre completo', type: 'text', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'monto', label: 'Monto', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'detalles', label: 'Observaciones', type: 'text' },
    { name: 'mes_alta', label: 'Mes alta', type: 'number', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
  ];

  constructor(
    private fb: FormBuilder,
    private employeesService: EmployeesService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.employeeId = idParam ? Number(idParam) : null;
    this.isAlta = this.router.url.startsWith('/empleado-alta');
    if (!this.isAlta && this.employeeId) {
      this.fields.push({ name: 'baja', label: 'Dar de baja', type: 'checkbox' });
    }

    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);
    this.form = this.fb.group(controls);

    if (this.employeeId) {
      this.employeesService.getEmployeeById(this.employeeId).subscribe({
        next: employee => this.form.patchValue(employee),
        error: err => this.toast.show(err.error.message, 'error')
      });
    }
  }

  submit(formValue: any) {
    if (this.employeeId) {
      if (this.isAlta) {
        formValue = { ...formValue, alta: true };
      }
      this.employeesService.updateEmployee(this.employeeId, this.anio, formValue).subscribe({
        next: (res) => {
          this.form.reset();
          this.router.navigate(['/sueldos', this.anio]);
          this.toast.show(res.status, 'success');
        },
        error: err => this.toast.show(err.error.sqlMessage, 'error')
      });
    } else {
      this.employeesService.createEmployee(this.anio, formValue).subscribe({
        next: (res) => {
          this.form.reset();
          this.router.navigate(['/sueldos', this.anio]);
          this.toast.show(res.status, 'success');
        },
        error: err => this.toast.show(err.error.sqlMessage, 'error')
      });
    }
  }

  cancel() {
    this.router.navigate(['/sueldos', this.anio]);
  }
}
