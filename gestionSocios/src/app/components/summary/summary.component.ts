import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { CardComponent } from '../commons/card/card.component';
import { StatisticsService } from '../../services/statistics.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit {
  summary: any = null;

  constructor(
    private statisticsService: StatisticsService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const mes = this.route.snapshot.paramMap.get('mes');
    const anio = this.route.snapshot.paramMap.get('anio');

    if (!mes || !anio) {
      this.toast.show('Mes y año no proporcionados', 'error');
      return;
    }

    this.statisticsService.getIncomeByMembershipCard(Number(mes), Number(anio)).subscribe({
      next: (res) => {
        this.summary = res;
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
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

  getMonthName(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
  }
}