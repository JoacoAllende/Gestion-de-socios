import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { MembershipService } from '../../services/membership.service';
import { CardComponent } from '../commons/card/card.component';

@Component({
  selector: 'app-membership-state',
  standalone: true,
  imports: [CommonModule, CardComponent],
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

  getCardClass(): string {
    if (!this.socio) return '';
    const estado = this.socio.estado_pago.toLowerCase().replace(' ', '-');
    return `estado-${estado}`;
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

  getIconClass(): string {
    if (!this.socio) return '';
    const estado = this.socio.estado_pago.toLowerCase().replace(' ', '-');
    return `icon-${estado}`;
  }

  getBadgeClass(): string {
    if (!this.socio) return '';
    const estado = this.socio.estado_pago.toLowerCase().replace(' ', '-');
    return `badge-${estado}`;
  }
}