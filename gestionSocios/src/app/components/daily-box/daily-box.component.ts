import { Component } from '@angular/core';
import { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { DailyBoxService } from '../../services/daily-box.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';

@Component({
  selector: 'app-daily-box',
  imports: [AgTableComponent],
  templateUrl: './daily-box.component.html',
  styleUrl: './daily-box.component.scss'
})
export class DailyBoxComponent {
  public gridApi!: GridApi;

  rowData: any[] = [];

  defaultColDef: ColDef = { flex: 1, minWidth: 100, resizable: true };

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'fecha',
      headerName: 'Fecha',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true
    },
    {
      field: 'concepto',
      headerName: 'Concepto',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true
    },
    {
      field: 'monto_ingreso',
      headerName: 'Ingreso efectivo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'monto_egreso',
      headerName: 'Egreso efectivo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'monto_transferencia',
      headerName: 'Banco',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'saldo',
      headerName: 'Saldo',
      valueFormatter: (params) => `$ ${params.value?.toLocaleString('es-AR') || 0}`
    },
  ];

  constructor(private dailyBoxService: DailyBoxService, private router: Router, private toast: ToastService) { }

  ngOnInit() {
    this.dailyBoxService.getDailyBox().subscribe({
      next: (data) => {
        this.rowData = data.map(movement => movement);
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });

  }

}
