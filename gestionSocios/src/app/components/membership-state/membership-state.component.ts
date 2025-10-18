import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { MembershipService } from '../../services/membership.service';


@Component({
  selector: 'app-membership-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './membership-state.component.html',
  styleUrl: './membership-state.component.scss'
})
export class MembershipStateComponent implements OnInit {
  socio: any = null;

  constructor(
    private membershipService: MembershipService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const dni = this.route.snapshot.paramMap.get('dni');

    if (!dni) {
      this.toast.show('DNI no proporcionado', 'error');
      return;
    }

    this.membershipService.getMembershipStateByDni(Number(dni)).subscribe({
      next: (res) => {
        this.socio = res;
      },
      error: (err) => {
        this.toast.show(err.error.message, 'error');
      }
    });
  }

  getEstadoClass(): string {
    if (!this.socio) return '';
    return this.socio.estado_pago.toLowerCase().replace(' ', '-');
  }

  getEstadoIcon(): string {
    if (!this.socio) return '';
    switch (this.socio.estado_pago) {
      case 'Al día':
        return '✓';
      case 'Atrasado':
        return '!';
      case 'Inactivo':
        return '✕';
      default:
        return '';
    }
  }
}