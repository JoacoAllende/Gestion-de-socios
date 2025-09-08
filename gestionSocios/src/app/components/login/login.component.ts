import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicFormComponent, FormField } from '../commons/dynamic-form/dynamic-form.component';
import { LoginService } from '../../services/login.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  socioId: number | null = null;

  fields: FormField[] = [
    { name: 'nombre', label: 'Usuario', type: 'text', validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
    { name: 'contraseña', label: 'Contraseña', type: 'text', isPassword: true, validators: [Validators.required], errorMessages: { required: 'Obligatorio' } },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    const controls: any = {};
    this.fields.forEach(f => controls[f.name] = [f.value ?? '', f.validators ?? []]);

    this.form = this.fb.group(controls);
  }

  submit(formValue: any) {
    this.loginService.loginUser(formValue).subscribe({
      next: (res) => {
        this.form.reset();
        this.router.navigate(['/socios']);
        this.toast.show(res.message, 'success');
      },
      error: (err) => {
        this.toast.show(err.error.status, 'error');
      }
    });
  }

  cancel() {
    this.loginService.logout();
  }
}
