import { Component } from '@angular/core';
import { CellClickedEvent, ColDef, ColGroupDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { DailyBoxService } from '../../services/daily-box.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AgTableComponent } from '../commons/ag-table/ag-table.component';
import { ButtonComponent } from '../commons/button/button.component';
import { MonthSelectorComponent } from '../commons/month-selector/month-selector.component';
import { exportGridToCsv } from '../../utils/export-csv.utils';

@Component({
  selector: 'app-daily-box',
  imports: [AgTableComponent, ButtonComponent, MonthSelectorComponent],
  templateUrl: './daily-box.component.html',
  styleUrl: './daily-box.component.scss'
})
export class DailyBoxComponent {
  public gridApi!: GridApi;
  anio: number = new Date().getFullYear();

  rowData: any[] = [];
  gridStyle = {
    width: '100%',
    height: 'calc(100% - 2rem - 70px)'
  };

  defaultColDef: ColDef = { resizable: true, wrapHeaderText: true, autoHeaderHeight: true };

  colDefs: (ColDef | ColGroupDef)[] = [
    {
      field: 'fecha',
      headerName: 'Fecha',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      width: 105
    },
    {
      field: 'concepto',
      headerName: 'Concepto',
      sortable: true,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      cellClass: 'ag-cell-clickable',
      flex: 1,
      minWidth: 250,
      onCellClicked: (event: CellClickedEvent) => {
        this.router.navigate([`/movimiento-caja/${event.data.id}`]);
      }
    },
    {
      field: 'monto_ingreso',
      width: 125,
      headerName: 'Ingreso efectivo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'monto_egreso',
      width: 125,
      headerName: 'Egreso efectivo',
      sortable: true,
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      valueFormatter: (params) =>
        params.value ? `$ ${params.value.toLocaleString('es-AR')}` : '❌'
    },
    {
      field: 'monto_transferencia',
      width: 125,
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
      width: 130,
      valueFormatter: (params) => `$ ${params.value?.toLocaleString('es-AR') || 0}`
    },
    {
      headerName: '',
      field: 'acciones',
      sortable: false,
      filter: false,
      cellRenderer: () => '<span style="cursor: pointer;">🗑️</span>',
      cellClass: 'ag-cell-clickable',
      width: 40,
      cellStyle: { paddingLeft: '0', paddingRight: '0', textAlign: 'center' },
      onCellClicked: (event: CellClickedEvent) => {
        this.confirmDeleteMovement(event.data);
      }
    },
  ];

  constructor(
    private dailyBoxService: DailyBoxService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) { }

  ngOnInit() {
    const anioParam = this.route.snapshot.paramMap.get('anio');
    this.anio = anioParam ? Number(anioParam) : new Date().getFullYear();
    this.loadData();
  }

  loadData() {
    this.dailyBoxService.getDailyBox(this.anio).subscribe({
      next: (data) => {
        this.rowData = data.map(movement => movement);
      },
      error: (err) => {
        this.toast.show(err.error?.message, 'error');
      }
    });
  }

  onGridReady = (event: GridReadyEvent) => {
    this.gridApi = event.api;
  }

  onYearChange = (event: { anio: number }) => {
    this.anio = event.anio;
    this.router.navigate(['/caja', this.anio]);
    this.loadData();
  }

  confirmDeleteMovement(movement: any) {
    if (!confirm(`¿Eliminar el movimiento "${movement.concepto}"? Se recalculará el saldo de los movimientos posteriores.`)) return;

    this.dailyBoxService.deleteMovement(movement.id).subscribe({
      next: (res) => {
        this.toast.show(res.status, 'success');
        this.loadData();
      },
      error: (err) => {
        this.toast.show(err.error?.sqlMessage || err.error?.message, 'error');
      }
    });
  }

  public createMovement = () => {
    this.router.navigate(['/movimiento-caja']);
  }

  exportCsv = () => {
    exportGridToCsv(this.gridApi);
  }
}
