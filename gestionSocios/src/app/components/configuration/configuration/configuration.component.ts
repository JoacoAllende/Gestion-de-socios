import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfigurationService } from '../../../services/configurations.service';
import { ToastService } from '../../../services/toast.service';
import { CardComponent } from '../../commons/card/card.component';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss'
})
export class ConfigurationComponent implements OnInit {
  activityValues: any[] = [];
  discounts: any[] = [];
  baseMemberValue: any = null;

  constructor(
    private configurationService: ConfigurationService,
    private toast: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadActivityValues();
    this.loadDiscounts();
    this.loadBaseMemberValue();
  }

  loadActivityValues() {
    this.configurationService.getActivityValues().subscribe({
      next: (res) => {
        this.activityValues = res;
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Error al cargar valores de actividad', 'error');
      }
    });
  }

  loadDiscounts() {
    this.configurationService.getDiscounts().subscribe({
      next: (res) => {
        this.discounts = res;
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Error al cargar descuentos', 'error');
      }
    });
  }

  loadBaseMemberValue() {
    this.configurationService.getBaseMemberValue().subscribe({
      next: (res) => {
        this.baseMemberValue = res;
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Error al cargar valor socio base', 'error');
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value);
  }

  editActivityValues() {
    this.router.navigate(['/configuraciones/valores-actividad']);
  }

  editDiscounts() {
    this.router.navigate(['/configuraciones/descuentos']);
  }

  editBaseMemberValue() {
    this.router.navigate(['/configuraciones/valor-socio-base']);
  }

  goToInitializeYear() {
    this.router.navigate(['/configuraciones/inicializar-anio']);
  }

  goToRecalculatePayments() {
    this.router.navigate(['/configuraciones/recalcular-pagos']);
  }
}