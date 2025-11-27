import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { CardComponent } from '../commons/card/card.component';
import { StatisticsService } from '../../services/statistics.service';
import { MonthSelectorComponent } from '../commons/month-selector/month-selector.component';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, CardComponent, MonthSelectorComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit {
  summary: any = null;
  mes: number = new Date().getMonth() + 1;
  anio: number = new Date().getFullYear();

  constructor(
    private statisticsService: StatisticsService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const mesParam = this.route.snapshot.paramMap.get('mes');
    const anioParam = this.route.snapshot.paramMap.get('anio');

    this.mes = mesParam ? Number(mesParam) : new Date().getMonth() + 1;
    this.anio = anioParam ? Number(anioParam) : new Date().getFullYear();

    this.loadData();
  }

  loadData() {
    this.statisticsService.getIncomeByMembershipCard(this.mes, this.anio).subscribe({
      next: (res) => {
        this.summary = res;
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });
  }

  onMonthChange = (event: { mes: number; anio: number }) => {
    this.mes = event.mes;
    this.anio = event.anio;
    this.router.navigate(['/resumenes', this.mes, this.anio]);
    this.loadData();
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